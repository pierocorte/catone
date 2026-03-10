import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { pipeline } from "node:stream/promises";

const app = express();
const port = process.env.PORT || 3000;

const isDocker = process.env.DOCKER === "true";
const BASE_URL = isDocker ? "host.docker.internal" : "localhost";
const LIB = process.env.LIB_URL || `http://${BASE_URL}:3010`;
const REG_URL = process.env.REG_URL || `http://${BASE_URL}:3001`;
const APP_URL = "localhost:3020";

// If you need cookies across origins, DON'T use "*" for ACAO.
// Either strictly allow - list or reflect the origin.
// const allowedOrigins = new Set([
//   "http://localhost:3000"
// ]);
// const corsOptions = {
//   origin(origin, cb) {
//     // allow non-browser clients (no Origin) + allow-listed browser origins
//     if (!origin || allowedOrigins.has(origin)) return cb(null, true);
//     return cb(new Error(`Not allowed by CORS: ${origin}`));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 204,
// };
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
// TO ALLOW ANY ORIGIN
// app.use(cors({ origin: true, credentials: true }));
// app.options("*", cors({ origin: true, credentials: true }));

app.use((req, res, next) => {
  const ora = new Date().toISOString();
  const metodo = req.method;
  const url = req.url;
  console.log(`1. [${ora}] Ricevuta richiesta:da ${metodo} su ${url}`);
  next();
});

app.get("/gping", (_req, res) => res.json({ status: "gpong" }));

app.all("/reg/*", async (req, res) => {
  let targetUrl = `${REG_URL}/${req.originalUrl.replace(/^\/reg\//, "")}`;
  if (!targetUrl) return res.status(404).send("Route not handled");
  handleRequest(req, res, targetUrl);
});

app.all("/lib/*", async (req, res) => {
  let targetUrl = `${LIB}/${req.originalUrl.replace(/^\/lib\//, "")}`;
  if (!targetUrl) return res.status(404).send("Route not handled");
  handleRequest(req, res, targetUrl);
});

app.all("/svc/:sname/*", async (req, res) => {
  const { sname } = req.params;
  const what = req.url.split("/");
  let r = await fetch(`${REG_URL}/url/${sname}`);
  r = await r.json();
  const targetUrl = `http://${r.url}/${what[3]}`;
  handleRequest(req, res, targetUrl);
});

app.all("/ip/*", async (req, res) => {
  let targetUrl = `http://${req.originalUrl.replace(/^\/ip\//, "")}`;
  if (!targetUrl) return res.status(404).send("Route not handled");
  handleRequest(req, res, targetUrl);
});

app.all("*", async (req, res) => {
  let targetUrl = `http://${APP_URL}${req.originalUrl}`;
  if (!targetUrl) return res.status(404).send("Route not handled");
  handleRequest(req, res, targetUrl);
});

async function handleRequest(req, res, targetUrl) {
  try {
    // Forward headers (drop hop-by-hop headers)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      // Only forward body for non-GET/HEAD
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    });

    // const data = await upstream.json(); // leggi UNA volta
    // console.log("questa è la risposta:", data.url);

    // Forward status
    res.status(upstream.status);
    // Forward upstream headers (excluding hop-by-hop)
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (["transfer-encoding", "connection", "keep-alive"].includes(k)) return;
      res.setHeader(key, value);
    });
    // Stream response body
    if (upstream.body) {
      await pipeline(upstream.body, res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Gateway error:", err);
    res.status(502).json({ error: "GATEWAY_ERROR" });
  }
}

app.listen(port, () => {
  console.log(`Gateway running at http://localhost:${port}`);
});

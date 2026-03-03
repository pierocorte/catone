import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { pipeline } from "node:stream/promises";

const app = express();
const port = process.env.PORT || 3000; // Port for the proxy server (AGW)

const isDocker = process.env.DOCKER === "true";
const BASE_URL = isDocker ? "host.docker.internal" : "localhost";
const APP_URL = "localhost:3000";

const REG_URL = process.env.REG_URL || `http://${BASE_URL}:3001`;
// If you need cookies across origins, DON'T use "*" for ACAO.
// Either strictly allow-list or reflect the origin.
// const allowedOrigins = new Set([
//     "http://localhost:3000"
// ]);
// const corsOptions = {
//     origin(origin, cb) {
//         // allow non-browser clients (no Origin) + allow-listed browser origins
//         if (!origin || allowedOrigins.has(origin)) return cb(null, true);
//         return cb(new Error(`Not allowed by CORS: ${origin}`));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     optionsSuccessStatus: 204,
// };
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// TO ALLOW ANY ORIGIN
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));

// Root (optional)
// app.get("/", (_req, res) => res.send("Proxy OK"));

function buildTargetUrl(req) {
  const original = req.originalUrl; // includes query string
  if (original.startsWith("/reg_csv/")) {
    // proxy to registry service on 3001 keeping path+query
    return `${REG_URL}/${original.replace(/^\/reg_csv\//, "")}`;
  }

  if (original.startsWith("/lib/")) {
    // proxy to local service on 3001 keeping path+query
    return `http://${BASE_URL}:3010/${original.replace(/^\/lib\//, "")}`;
  }
  if (original.startsWith("/url/")) {
    // WARNING: open proxy (security risk). Keep only if you trust callers.
    return `http://${original.replace(/^\/url\//, "")}`;
  }
  if (original.startsWith("/api/")) {
    // WARNING: open proxy (security risk). Keep only if you trust callers.
    return `http://${original.replace(/^\/api\//, "")}`;
  }
  if (original.startsWith("/ip/")) {
    const target = `http://${original.replace(/^\/ip\//, "")}`;
    return `${target}`;
  }
  // const parts = original.split("/");
  // //ping manager /service
  // if (parts[2] === "ping") {
  //   const target = `${REG_URL}/url/${parts[1]}`;
  //   const r = await fetch(target);
  //   const url = await r.json();
  //   return `http://${url}/ping`;
  // }
  // if (parts[2] === "disturb") {
  //   const target = `${REG_URL}/url/${parts[1]}`;
  //   const r = await fetch(target);
  //   const url = await r.json();
  //   return `http://${url}/disturb`;
  // }

  if (original.startsWith("/")) {
    // proxy to main frontend
    return `http://${APP_URL}${original}`;
  }

  return null;
}

app.get("/gping", (_req, res) => res.json({ status: "gpong" }));

// Proxy for ALL methods (GET/POST/PUT/PATCH/DELETE)
app.all("*", async (req, res) => {
  let targetUrl = await buildTargetUrl(req);
  if (!targetUrl) return res.status(404).send("Route not handled");
  //console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${targetUrl}`);
  targetUrl = await resolveEndPoint(targetUrl);
  console.log(targetUrl);
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
    console.error("Proxy error:", err);
    res.status(502).json({ error: "PROXY_ERROR" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

function resolveEndPoint(targetUrl) {
  const serviceName = targetUrl.split("/")[2];
  return fetch(REG_URL + "/url/" + serviceName);
}

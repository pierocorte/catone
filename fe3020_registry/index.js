import express from "express";
import cors from "cors";

const app = express();
const port = 3020;
const SERVICE_NAME = "myself";

// const allowedOrigins = [
//   'http://localhost:3000'
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) callback(null, true);
//     else callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true // se devi usare cookie o auth
// };
// app.use(cors(corsOptions));

// app.use(cors({ origin: true, credentials: true }));
// app.options("*", cors({ origin: true, credentials: true }));

app.use("/", express.static("static"));

app.get("/ping", (_req, res) => res.json({ status: "pong" }));

app.get("/hello", (req, res) => {
  res.send(`hello from ${SERVICE_NAME}`);
});

async function registerService() {
  try {
    const res = await fetch("http://localhost:3000/reg_csv/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: SERVICE_NAME,
        url: `localhost:${port}`,
      }),
    });
    return res.ok;
  } catch (err) {
    res.status(502).json({ error: "PROXY_ERROR" });
  }
}

async function sendHeartBeat() {
  const res = await fetch(
    `http://localhost:3000/reg_csv/service/${SERVICE_NAME}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "on" }),
    },
  );
  return res.ok;
}

// register and send heartbeat
let logged = false;
setInterval(async () => {
  if (!logged) {
    logged = await registerService();
    console.log("trying to be registed");
  }
  if (logged) {
    logged = await sendHeartBeat();

    console.log("i'm registered,sending an heartbeat...");
  }
}, 5000);

app.listen(port, () => {
  console.log(`mainfe is running at http://localhost:${port}`);
});

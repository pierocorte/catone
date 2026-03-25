import express, { json } from "express";
import cors from "cors";

const app = express();
const PORT = 3012;
const SERVICE_NAME = "fake-service2";
const TIME = 10 * 1000;

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
app.get("/ping", (_req, res) => {
  res.json({ status: "pong" });
});

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running at http://localhost:${PORT}`);
});

async function registerService() {
  try {
    const res = await fetch("http://localhost:3000/reg/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: SERVICE_NAME,
        url: `localhost:${PORT}`,
      }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

async function unregisterService() {
  try {
    const res = await fetch(
      `http://localhost:3000/reg/service/${SERVICE_NAME}`,
      {
        method: "DELETE",
      },
    );
    return res.ok;
  } catch (err) {
    return false;
  }
}

async function sendHeartBeat() {
  try {
    const res = await fetch(
      `http://localhost:3000/reg/service/${SERVICE_NAME}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "on" }),
      },
    );
    return res.ok;
  } catch (err) {
    return false;
  }
}

let logged = registerService();
setInterval(async () => {
  console.log("HEARTBEAT");
  if (!logged) {
    console.log("trying to be registed", logged);
    logged = await registerService();
    console.log("LOGGED", logged);
  }
  if (logged) {
    console.log("i'm registered,sending an heartbeat...", logged);
    logged = await sendHeartBeat();
  }
}, TIME);

async function shutdown() {
  try {
    console.log("shutdown...");
    await unregisterService();
  } catch (err) {
    process.exit(1);
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

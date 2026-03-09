import express, { json } from "express";
import cors from "cors";

const app = express();
const port = 3012;
const serviceName = "fake-service2";
const TIME = 600 * 1000;

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

app.get("/disturb", (req, res) => {
  // sleep(2000).then(() => res.json({ status: "you're welcome!" }));
});

app.listen(port, () => {
  console.log(`${serviceName} is running at http://localhost:${port}`);
});

async function registerService() {
  const res = await fetch("http://localhost:3000/reg/service", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: serviceName,
      url: `localhost:${port}`,
    }),
  });
  return res.ok;
}

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

async function sendHeartBeat() {
  const res = await fetch(`http://localhost:3000/REG/service/${serviceName}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "on" }),
  });
  return res.ok;
}

// register and send heartbeat
// let logged = false;
let logged = registerService();
setInterval(async () => {
  if (!logged) {
    logged = await registerService();
    console.log("trying to be registed");
  }
  if (logged) {
    logged = await sendHeartBeat();

    console.log("i'm registered,sending an heartbeat...");
  }
}, TIME);

import express from "express";
import cors from "cors";

const app = express();
const port = 3020;
const serviceName = "fake-service";
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

app.listen(port, () => {
  console.log(`${serviceName} is running at http://localhost:${port}`);
});

async function registerService() {
  try {
    const res = await fetch("http://localhost:3000/reg_csv/service", {
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
  } catch (err) {
    res.status(502).json({ error: "PROXY_ERROR" });
  }
}

async function sendHeartBeat() {
  try {
    const res = await fetch(
      `http://localhost:3000/reg_csv/service/${serviceName}/heartbeat`,
      {
        method: "PUT",
      },
    );
    return res.ok;
  } catch (err) {
    res.status(502).json({ error: "PROXY_ERROR" });
  }
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

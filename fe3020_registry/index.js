import express from "express";

const app = express();
const PORT = 3020;
const SERVICE_NAME = "myself";
const TIME = 10 * 1000;



app.use("/", express.static("static"));

app.get("/ping", (_req, res) => res.json({ status: "pong" }));

app.get("/hello", (req, res) => {
  res.send(`hello from ${SERVICE_NAME}`);
});

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running at http://localhost:${PORT}`);
});

async function registerService() {
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
}

async function sendHeartBeat() {
  const res = await fetch(`http://localhost:3000/reg/service/${SERVICE_NAME}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "on" }),
  });
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
}, TIME);

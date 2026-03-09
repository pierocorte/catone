import express, { json } from "express";
import JSONSERVICE from "./JsonService.js";
import SERVICES from "./ServiceList.js";
import Service from "./Service.js";

const TIMEOUT = 6000000;
const KICK_OUT_TIMEOUT = 10000;

const app = express();
app.use(express.json());
const port = 3001;

app.listen(port, () => {
  console.log(`reg_csv is running at http://localhost:${port}`);
});

app.get("/ping", (_req, res) => res.json({ status: "pong by REG" }));

//registra un nuovo srvizio
app.post("/service", (req, res) => {
  const { name, url } = req.body;
  const heartBeat = Date.now();
  if (!name || !url) {
    return res
      .status(400)
      .json({ error: "service's name and url are required" });
  }
  try {
    const s = new Service({ name, url, heartBeat });
    SERVICES.register(s);
    return res.status(201).json({ message: "service registered" });
  } catch (err) {
    //ho modificato la risposta!
    return;
  }
});

//cancella il servizio
app.delete("/service", (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res
        .status(400)
        .json({ error: "service's name and url are required" });
    }

    const s = new Service({ name, url });
    SERVICES.unregister(s);

    return res.status(201).json({ message: "service unregistered" });
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }
});

//mi restiuisce tutti i servizi
app.get("/service", (req, res) => {
  try {
    const services = SERVICES.getAll();
    return res.status(200).json(services);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch", details: err.message });
  }
});
//con nome servizio ti restiusice l'url
app.get("/url/:name", (req, res) => {
  const url = SERVICES.getUrl(req.params.name);
  if (!url) {
    return res.status(404).json({ message: "no service active found" });
  }
  return res.status(200).send({ service: req.params.name, url: url });
});

app.patch("/service/:name", (req, res) => {
  const name = req.params.name;
  const status = req.body.status;

  if (name === undefined) {
    return res.status(400).json({ error: " name is mandatory" });
  }

  try {
    SERVICES.updateHeartBeat(name);
  } catch (err) {
    return res.status(404).json({ error: "service not registed" });
  }
  if (!status) {
    return res.status(200).json({ message: "status, updated" });
  }
  try {
    SERVICES.changeStatus(name, status);
    JSONSERVICE.write(SERVICES.getAll());

    return res.status(200).json({ message: "status, updated" });
  } catch (err) {
    return res.status(400).json({ error: "not updated", details: err.message });
  }
});

setInterval(() => {
  const globalClock = Date.now();
  SERVICES.getAll().forEach((s) => {
    if (globalClock - s.heartBeat > TIMEOUT) {
      SERVICES.changeStatus(s.name, "off");
      //   if (globalClock - s.heartBeat > KICK_OUT_TIMEOUT) {
      //     SERVICES.unregister(s);
      //   }
    } else {
      SERVICES.changeStatus(s.name, "on");
    }
  });
}, TIMEOUT);

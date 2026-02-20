import express, { json } from "express";
import JSONSERVICE from "./JsonService.js";
import SERVICES from "./ServiceList.js";
import Service from "./Service.js";

const FILE_UPDATE_TIMEOUT = 10000;
const PING_TIMEOUT = 5000;

const app = express();
app.use(express.json());
const port = 3001;

// app.get("/ping", (_req, res) => res.json({ status: "pong" }));

// app.get("/hello", (req, res) => {
//   res.send("Hello from registry!");
// });

const services = JSONSERVICE.getAll();
services.forEach((s) => SERVICES.register(s));

app.listen(port, () => {
  console.log(`reg_csv is running at http://localhost:${port}`);
});

//registra un nuovo srvizio
app.post("/service", (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res
      .status(400)
      .json({ error: "service's name and url are required" });
  }

  try {
    const s = new Service({ name, url });
    SERVICES.register(s);
    JSONSERVICE.write(SERVICES.getAll());
    return res.status(201).json({ message: "service registered" });
  } catch (err) {
    return res.status(409).json({ error: err.message });
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
    JSONSERVICE.write(SERVICES.getAll());

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
//TODO da modificare
app.get("/url/:name", (req, res) => {
  const url = SERVICES.getUrl(req.params.name);
  if (!url) {
    return res.status(500).json({ message: "no service active found" });
  }
  return res.status(200).json(url);
});

// modifica lo stato del servizio per metterti su off
app.patch("/service/:url", (req, res) => {
  const url = req.params.url;
  const status = req.body.status;

  if (status === undefined || url === undefined) {
    return res.status(400).json({ error: " status and url are mandatory" });
  }
  const s = new Service({ url });
  try {
    SERVICES.changeStatus(s, status);
    JSONSERVICE.write(SERVICES.getAll());

    res.status(200).json({ message: "status, updated" });
  } catch (err) {
    res.status(400).json({ error: "not updated", details: err.message });
  }
});

//TODO puo' essere migliorato vedendo se ci sono stati cambiamenti
// setInterval(() => {
//   JSONSERVICE.write(SERVICES.getAll());
// }, FILE_UPDATE_TIMEOUT);

//TODO da cambiare con macro
setInterval(() => {
  SERVICES.getAll().forEach((s) => {
    fetch(`http://localhost:3000/ip/${s.url}`)
      .then((r) => {
        if (!r.ok) {
          SERVICES.changeStatus(s, "off");
        } else {
          SERVICES.changeStatus(s, "on");
        }
      })
      .catch(() => {
        console.log("gateway down");
        SERVICES.changeStatus(s, "off");
      });
  });
}, PING_TIMEOUT);

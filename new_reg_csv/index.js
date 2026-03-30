import express, { json } from "express";
import SERVICES from "./ServiceList.js";
const app = express();
app.use(express.json());
const port = 3001;

app.listen(port, () => {
  console.log(`reg_csv is running at http://localhost:${port}`);
});

app.get("/ping", (_req, res) => res.json({ status: "pong by REG" }));

//registra un nuovo servizio
app.post("/service", (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({
      error: "service's name and url are required",
    });
  }
  try {
    SERVICES.register(name, url);
    return res.status(201).json({ message: "service registered" });
  } catch (err) {
    return res.status(400).json({
      error: "err : " + err.message,
    });
  }
});

//deregistra il servizio
app.delete("/service/:sName", (req, res) => {
  const { sName } = req.params;
  try {
    if (!sName) {
      return res.status(400).json({ error: "service's url is required" });
    }
    SERVICES.unregister(sName);
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
  const sName = req.params.name;
  const url = SERVICES.geActiveServicetUrl(sName);
  if (!url) {
    return res.status(404).json({ message: "no service active found" });
  }
  return res.status(200).send({ url: url });
});

//aggiornamento stato servizio
app.patch("/service/:name", (req, res) => {
  const name = req.params.name;
  const status = req.body.status;

  if (name === undefined) {
    return res.status(400).json({ error: " name is mandatory" });
  }

  try {
    SERVICES.changeStatus(name, status);

    return res.status(200).json({ message: "status, updated" });
  } catch (err) {
    return res.status(400).json({ error: "not updated", details: err.message });
  }
});

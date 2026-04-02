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
      error: "service name and url are required",
    });
  }

  try {
    const result = SERVICES.register(name, url);

    if (result.status === "already_exists") {
      return res.status(200).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    if (
      err.message === "name already used" ||
      err.message === "url already used"
    ) {
      return res.status(409).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: "internal server error",
    });
  }
});

//deregistra il servizio
app.delete("/service/:sName", (req, res) => {
  const { sName } = req.params;
  try {
    if (!sName) {
      return res.status(400).json({ error: "service's name is required" });
    }
    SERVICES.unregister(sName);
    return res.status(204).json({ message: "service unregistered" });
  } catch (err) {
    return res.status(404).json({ error: err.message });
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

//RESOLVER

//con nome servizio ti restiusice l'endpoint
app.get("/url/:name", (req, res) => {
  const sName = req.params.name;
  const url = SERVICES.getActiveServicetUrl(sName);
  if (!url) {
    return res.status(404).json({ message: "no service active found" });
  }
  return res.status(200).send({ url: url });
});

//con endpoint servizio restituisce nome logico
app.get("/sname/:endpoint", (req, res) => {
  const endpoint = req.params.endpoint;
  const name = SERVICES.getActiveServiceName(endpoint);
  if (!name) {
    return res.status(404).json({ message: "no service active found" });
  }
  return res.status(200).send({ name: name });
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

    return res.status(204).json({ message: "status, updated" });
  } catch (err) {
    return res.status(400).json({ error: "not updated", details: err.message });
  }
});

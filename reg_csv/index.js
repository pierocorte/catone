import express from "express";
import cors from "cors";
import REG from "./jsonServiceRegistry.js";
const app = express();
app.use(express.json());
const port = 3001;

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

app.get("/ping", (_req, res) => res.json({ status: "pong" }));

app.get("/hello", (req, res) => {
  res.send("Hello from registry!");
});

app.listen(port, () => {
  console.log(`reg_csv is running at http://localhost:${port}`);
});

//registra un nuovo srvizio
app.post("/service", (req, res) => {
  const { name, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: "name and url required" });
  }

  try {
    REG.register(req.body);
    return res.status(201).json({ message: "service registered" });
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }
});

//cancella il servizio
app.delete("/service", (req, res) => {
  try {
    REG.unregister(req.body);
    return res.status(201).json({ message: "service unregistered" });
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }
});

//mi restiuisce tutti i servizi
app.get("/services", (req, res) => {
  try {
    const services = REG.getAll();
    return res.status(200).json(services);
  } catch (err) {
    res.status(500).send({ error: "failed to fetch", details: err.message });
  }
});
//con nome servizio ti restiusice l'ip
app.get("/service", (req, res) => {
  const name = req.body;

  const filtered = REG.getAll().filter(
    (s) => s.name === name && s.status === "on",
  );
  if (!filtered) {
    return res.status(500).json({ message: "no service active found" });
  }
  return res.status(200).json(filtered[0].url);
});

// modifica lo stato del servizio
app.patch("/service", (req, res) => {
  const { name, url, status } = req.body;

  if (!name || !url || status === undefined) {
    return res.status(400).json({ error: "name, url are mandatory" });
  }

  try {
    REG.updateStatus({ name, url }, status);
    res.status(200).json({ message: "status, updated" });
  } catch (err) {
    res.status(400).json({ error: "not updated", details: err.message });
  }
});

setInterval(() => {
  const services = REG.getAll();
  services.forEach((e) => {
    fetch(e.url + "/ping")
      .then((r) => {
        if (r.ok) {
          console.log(e.name, "is active");
        }
      })
      .catch(() => {
        console.log(e.name, "is down");
        REG.updateStatus(e, (e.status = "off"));
      });
  });
}, 5000);

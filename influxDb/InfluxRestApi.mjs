import { response } from "express";
import { Service } from "../helper/Service.js";

export class InfluxRestApi extends Service {
  constructor() {
    const name = process.env.name || "default";
    const port = process.env.port || "1234";
    super(port, name);

    this.DB_NAME = process.env.DB_NAME;
    this.DB_TOKEN = process.env.DB_TOKEN;
    this.DB_PORT = process.env.DB_PORT;
    this.DB_HOST = process.env.DB_HOST;

    this.registerRoutes();
  }

  registerRoutes() {
    this.app.get("/:deviceClass/:id/observations", async (req, res) => {
      const { deviceClass, id } = req.params;
      const columns = this.buildColumns(req);

      const condition = this.buildCondition(req);

      const query = `SELECT ${columns} FROM ${deviceClass} ` + condition;

      try {
        const response = await fetch(
          `http://${this.DB_HOST}:${this.DB_PORT}/api/v3/query_sql`,
          {
            method: "POST",
            headers: {
              authorization: this.DB_TOKEN,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              db: this.DB_NAME,
              q: query,
            }),
          },
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const result = await response.json();

        return res.status(200).json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });
    this.app.get("/:deviceClass/observations", async (req, res) => {
      const { deviceClass } = req.params;
      const columns = this.buildColumns(req);

      const condition = this.buildCondition(req);
      const query = `SELECT ${columns} FROM ${deviceClass} ` + condition;

      try {
        const response = await fetch(
          `http://${this.DB_HOST}:${this.DB_PORT}/api/v3/query_sql`,
          {
            method: "POST",
            headers: {
              authorization: this.DB_TOKEN,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              db: this.DB_NAME,
              q: query,
            }),
          },
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const result = await response.json();

        return res.status(200).json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    this.app.get("/:deviceClass/:id", async (req, res) => {
      const { deviceClass, id } = req.params;
      const columns = this.buildColumns(req);
      const query = `SELECT ${columns} FROM ${deviceClass} WHERE device_id = '${id}'`;
      try {
        const response = await fetch(
          `http://${this.DB_HOST}:${this.DB_PORT}/api/v3/query_sql?db=${this.DB_NAME}&q=${query}`,
          {
            headers: {
              authorization: this.DB_TOKEN,
              Accept: "application/json",
            },
          },
        );
        let result = await response.json();
        return res.status(200).json(result);
      } catch (error) {
        return res.status(500).json({ error: response.status });
      }
    });

    this.app.get("/:deviceClass", async (req, res) => {
      const { deviceClass } = req.params;
      const query = `SELECT DISTINCT device_id FROM ${deviceClass}`;
      try {
        const response = await fetch(
          `http://${this.DB_HOST}:${this.DB_PORT}/api/v3/query_sql?db=${this.DB_NAME}&q=${query}`,
          {
            headers: {
              authorization: this.DB_TOKEN,
              Accept: "application/json",
            },
          },
        );
        let result = await response.json();
        return res.status(200).json(result);
      } catch (error) {
        return res.status(500).json({ error: response.status });
      }
    });
  }

  parseList(value) {
    if (!value) return [];

    const values = Array.isArray(value) ? value : [value];

    return values
      .flatMap((v) => String(v).split(","))
      .map((v) => v.trim())
      .filter(Boolean);
  }
  buildColumns(req) {
    const { metric } = req.query;
    const metrics = this.parseList(metric);
    let columns = "";

    columns = metrics.length ? metrics.join(", ") : "*";

    return columns;
  }

  buildCondition(req) {
    const { start, end, metric, device } = req.query;
    const { id } = req.params;

    const where = [];

    if (!start && !end) {
      where.push(`time <= now()`);
    }

    if (start) {
      where.push(`time >= '${start}'`);
    }

    if (end) {
      where.push(`time <= '${end}'`);
    }

    if (id) {
      where.push(`device_id = '${id}'`);
    }

    const devices = this.parseList(device);
    if (devices.length) {
      where.push(`device_id IN (${devices.map((d) => `'${d}'`).join(", ")})`);
    }

    const condition = where.length ? `WHERE ${where.join(" AND ")}` : "";

    console.log(condition);
    return condition;
  }

  //TODO al momento l'id del dispositivo si chiamerà device_id ma andrà cambiato in id.
  //TODO lancia errori

  buildPoint(req) {
    const { deviceClass } = req.params;
    const data = req.body;

    if (!Array.isArray(data)) {
      throw new Error("Body must be an array");
    }

    const lines = data.map((item) => {
      const { device_id, metric, value, unit, timestamp } = item;

      if (!device_id || !metric || value === undefined || !timestamp) {
        throw new Error("Missing required fields");
      }

      const measurement = metric;

      const tags = `device_id=${device_id}`;

      let fields = `value=${value}`;
      if (unit) {
        fields += `,unit="${unit}"`;
      }

      const ts = timestamp;

      return `${deviceClass},${tags} ${fields} ${ts}`;
    });

    return lines.join("\n");
  }
}
const influxRestApi = new InfluxRestApi();
export default influxRestApi;

import express from "express";
import dotenv from "dotenv";
dotenv.config();

export class Service {
  constructor() {
    this.port = process.env.port || "default";
    this.name = process.env.name || "default";
    this.GATEWAY = process.env.GATEWAY;

    this.app = express();
    this.server = null;

    this.basicRouteSetup();
    this.signalHandler();

    this.#init();
  }

  #init() {
    this.server = this.app.listen(this.port, () => {
      console.log(`${this.name} is running at http://localhost:${this.port}`);
    });
    this.#register();
  }

  basicRouteSetup() {
    this.app.use("/", express.static("static"));
    this.app.get("/ping", (_req, res) => res.json({ status: "pong" }));
  }

  signalHandler() {
    process.on("SIGINT", () => this.shutdown());
    process.on("SIGTERM", () => this.shutdown());
  }

  async #register() {
    await fetch(this.GATEWAY + "/reg/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.name,
        url: `localhost:${this.port}`,
      }),
    });
  }

  async on() {
    await fetch(this.GATEWAY + "/reg/service/" + this.name, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "on",
      }),
    });
    console.log("i'm on");
  }

  async off() {
    await fetch(this.GATEWAY + "/reg/service/" + this.name, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "off",
      }),
    });
    console.log("i'm off");
  }

  async shutdown() {
    await fetch(this.GATEWAY + "/reg/service/" + this.name, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("i'm quitting...");

    this.server.close(() => process.exit(0));
  }
}

import express from "express";

export class Helper {
  constructor(port, name) {
    this.port = port;
    this.name = name;
    this.server = null;

    this.init();
    this.basicRouteSetup();
    this.signalHandler();
  }

  async init() {
    this.app = express();
    this.server = this.app.listen(this.port, () => {
      console.log(`${this.name} is running at http://localhost:${this.port}`);
    });
  }

  basicRouteSetup() {
    this.app.use("/", express.static("static"));
    this.app.get("/ping", (_req, res) => res.json({ status: "pong" }));
  }

  signalHandler() {
    process.on("SIGINT", () => this.shutdown());
    process.on("SIGTERM", () => this.shutdown());
  }

  async register() {
    await fetch("http://localhost:3000/reg/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.name,
        url: `localhost:${this.port}`,
      }),
    });
    console.log("i'm registered");
  }

  async setOn() {
    await fetch("http://localhost:3000/reg/service/" + this.name, {
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

  async setOff() {
    await fetch("http://localhost:3000/reg/service/" + this.name, {
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
    await fetch("http://localhost:3000/reg/service/" + this.name, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("i'm quitting...");

    this.server.close(() => process.exit(0));
  }
}

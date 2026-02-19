import fs from "fs";
const FILENAME = "serviceList.jsonl";

class ServiceRegistry {
  getAll() {
    try {
      const txt = fs.readFileSync(FILENAME, "utf8");
      if (!txt.trim()) return [];
      const lines = txt.split("\n");
      const services = lines
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
      return services;
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  register(service) {
    const services = this.getAll();
    const exists = services.some(
      (s) => s.name === service.name && s.url === service.url,
    );
    if (exists) throw new Error("service already exists");
    fs.appendFileSync(FILENAME, JSON.stringify(service) + "\n", "utf8");
  }

  unregister(service) {
    const services = this.getAll();
    const index = services.findIndex(
      (s) => s.name === service.name && s.url === service.url,
    );
    if (index === -1) return;
    services.splice(index, 1);
    fs.writeFileSync(FILENAME, "", "utf8");
    services.forEach((s) => {
      fs.appendFileSync(FILENAME, JSON.stringify(s) + "\n", "utf8");
    });
  }

  updateStatus(service, status) {
    const services = this.getAll();
    const ns = services.find(
      (s) => s.name === service.name && s.url === service.url,
    );
    if (ns != null) {
      ns.status = status;
      this.unregister(ns);
      this.register(ns);
    }
  }
  clearData() {
    fs.writeFileSync(FILENAME, "", "utf-8");
  }
}

const REG = new ServiceRegistry();
export default REG;

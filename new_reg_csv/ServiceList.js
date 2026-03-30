import Service from "./Service.js";
import JSONSERVICE from "./JsonService.js"; //per la persistenza

export class ServiceList {
  constructor() {
    this.services = JSONSERVICE.getAll();
  }

  register(name, url) {
    let nameUsed = false;
    let urlUsed = false;

    this.services.forEach((s) => {
      if (s.name === name) nameUsed = true;
      if (s.url === url) urlUsed = true;
    });

    if (nameUsed && urlUsed) {
      throw new Error("service already registered");
    }

    if (urlUsed) {
      throw new Error("url already used");
    }

    if (nameUsed) {
      throw new Error("name already used");
    }

    this.services.push(new Service(name, url));
    JSONSERVICE.write(this.services);
  }

  unregister(serviceName) {
    const index = this.services.findIndex((s) => s.name === serviceName);

    if (index === -1) {
      throw new Error("Service not found");
    }

    this.services.splice(index, 1);
    JSONSERVICE.write(this.services);
  }
  eraseServices() {
    this.services = [];
    this.JSONSERVICE.eraseServices();
  }

  changeStatus(name, status) {
    const s = this.services.find((s) => s.name === name);
    if (!s) {
      throw new Error("Service not found");
    }
    s.status = status;
    JSONSERVICE.write(this.services);
  }

  geActiveServicetUrl(serviceName) {
    return this.services.find(
      (s) => s.name === serviceName && s.status === "on",
    )?.url;
  }

  getAll() {
    return this.services;
  }
}

const SERVICES = new ServiceList();
export default SERVICES;

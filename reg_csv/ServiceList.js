import Service from "./Service.js";
import JSONSERVICE from "./JsonService.js"; //per la persistenza

export class ServiceList {
  constructor() {
    this.services = JSONSERVICE.getAll();
  }

  register(name, url) {
    const sameService = this.services.find(
      (s) => s.name === name && s.url === url,
    );

    if (sameService) {
      return {
        status: "already_exists",
        message: "service already registered",
      };
    }

    const nameUsed = this.services.find((s) => s.name === name);
    if (nameUsed) {
      throw new Error("name already used");
    }

    const urlUsed = this.services.find((s) => s.url === url);
    if (urlUsed) {
      throw new Error("url already used");
    }

    const service = new Service(name, url);
    this.services.push(service);
    JSONSERVICE.write(this.services);

    return {
      status: "created",
      message: "service registered",
    };
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

  getActiveServicetUrl(serviceName) {
    return this.services.find(
      (s) => s.name === serviceName && s.status === "on",
    )?.url;
  }
  getActiveServiceName(url) {
    return this.services.find((s) => s.url === url && s.status === "on")?.name;
  }

  getAll() {
    return this.services;
  }
}

const SERVICES = new ServiceList();
export default SERVICES;

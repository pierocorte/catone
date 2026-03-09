import Service from "./Service.js";

export class ServiceList {
  constructor() {
    this.services = [];
  }

  register(service) {
    if (
      this.services.some(
        (s) => s.name === service.name && s.url === service.url,
      )
    )
      throw new Error("Service already exists");

    this.services.push(service);
  }

  unregister(service) {
    const index = this.services.findIndex(
      (s) => s.name === service.name && s.url === service.url,
    );
    if (index == -1) {
      throw new Error("element not Found");
    }
    this.services.splice(index, 1);
  }

  changeStatus(name, status) {
    const s = this.services.find((s) => s.name === name);
    if (!s) {
      throw new Error("Service not found");
    }
    s.status = status;
  }
  updateHeartBeat(serviceName) {
    const s = this.services.find((s) => s.name === serviceName);
    if (!s) {
      throw new Error("Service not found");
    }
    s.heartBeat = Date.now();
  }

  getUrl(serviceName) {
    return this.services.find((s) => s.name === serviceName)?.url;
  }

  getAll() {
    return this.services;
  }
}

const SERVICES = new ServiceList();
export default SERVICES;

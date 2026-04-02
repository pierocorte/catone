const STATUS = {
  ON: "on",
  OFF: "off",
};

export default class Service {
  constructor(name, url) {
    this.name = name;
    this.url = url;
    this.status = STATUS.OFF;
  }
}

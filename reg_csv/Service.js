const STATUS = {
  ON: "on",
  OFF: "off",
};

class Service {
  constructor(data) {
    this._name = data.name;
    this._url = data.url;
    this._descr = data.descr;
    this._status = STATUS.ON;
  }

  get name() {
    return this._name;
  }

  get url() {
    return this._url;
  }

  get descr() {
    return this._descr;
  }

  get status() {
    return this._status;
  }

  set name(value) {
    this._name = value;
  }

  set url(value) {
    this._url = value;
  }

  set descr(value) {
    this._descr = value;
  }

  set status(value) {
    if (!Object.values(STATUS).includes(value)) {
      throw new Error("invalid status");
    }
    this._status = value;
  }
}

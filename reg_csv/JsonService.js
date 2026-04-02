import fs from "fs";
const FILENAME = "serviceList.json";

class JsonService {
  getAll() {
    try {
      const data = fs.readFileSync(FILENAME, "utf8");
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        fs.writeFileSync(FILENAME, JSON.stringify([]));
        return [];
      }
      throw err;
    }
  }

  write(data) {
    return fs.writeFileSync(FILENAME, JSON.stringify(data, null, 2));
  }
  erase() {
    fs.writeFileSync(FILENAME, JSON.stringify([]));
    return [];
  }
}

const JSONSERVICE = new JsonService();
export default JSONSERVICE;

import { Service } from "../helper/Service.js";

export class TrailSv extends Service {
  constructor() {
    const name = process.env.name || "default";
    const port = process.env.port || "1234";
    super(port, name);
  }
}

const TRAILSV = new TrailSv();
export default TRAILSV;

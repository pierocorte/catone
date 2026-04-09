import { Service } from "../helper/Service.js";

class Frontend3020 extends Service {
  constructor() {
    //port and name are at the .env file
    super();
    super.on();
  }
}
const FRONTEND = new Frontend3020();

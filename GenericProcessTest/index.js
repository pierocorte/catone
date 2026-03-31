import { Helper } from "../helper/helper.js";
const help = new Helper(2001, "help");

await help.register();
await help.setOn();

console.log("waiting...");

setTimeout(async () => {
  await help.setOff().then(() => {});
}, 5000);

setTimeout(async () => {
  await help.shutdown().then(() => {});
}, 10000);

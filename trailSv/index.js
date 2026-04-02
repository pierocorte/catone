import TRAILSV from "./TrailSv.js";

async function main() {
  try {
    await TRAILSV.register();
    await TRAILSV.setOn();

    console.log("waiting...");

    // setTimeout(async () => {
    //   await TRAILSV.setOff();
    // }, 5000);

    // setTimeout(async () => {
    //   await TRAILSV.shutdown();
    // }, 10000);
  } catch (err) {
    console.log(err);
  }
}

main();

import TRAILSV from "./TrailSv.js";

async function main() {
  try {
    await TRAILSV.on();

    console.log("waiting...");

    setTimeout(async () => {
      await TRAILSV.off();
    }, 10000);

    setTimeout(async () => {
      await TRAILSV.on();
    }, 20000);

    setTimeout(async () => {
      await TRAILSV.shutdown();
    }, 30000);
  } catch (err) {
    console.log(err);
  }
}

main();

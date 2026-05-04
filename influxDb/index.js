import TRAILSV from "./InfluxRestApi.mjs";

async function main() {
  try {
    await TRAILSV.on();

    console.log("waiting...");

    setTimeout(async () => {
      await TRAILSV.on();
    }, 20000);
  } catch (err) {
    return err;
  }
}

main();

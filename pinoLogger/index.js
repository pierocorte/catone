import express from "express";
import logger from "./logger.js";

const app = express();

function pinoMiddleware(req, res, next) {
  //per aggiungere le proprità da svare nel log

  logger.info({
    method: req.method,
    url: req.originalUrl,
    //per leggere id.
    //id: req.headers.special,
  });
  res.status();
}

app.use(pinoMiddleware);

// app.get("*", (req, res) => {
//   res.send(req.id);
// });
app.listen(4000, () => {
  console.log("Pino Server is running on port 4000");
});

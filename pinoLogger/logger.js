import pino from "pino";
import fs from "fs";

const stream = fs.createWriteStream("./server.log", "utf8", "a");

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    base: false,
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
  },
  stream,
);
export default logger;

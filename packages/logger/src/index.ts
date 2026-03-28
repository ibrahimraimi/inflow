import pino from "pino";
import pretty from "pino-pretty";

const isDev = process.env.NODE_ENV === "development";

const stream = isDev
  ? pretty({
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "HH:MM:ss Z",
    })
  : undefined;

export const logger = stream
  ? pino({ level: process.env.LOG_LEVEL || "info" }, stream)
  : pino({ level: process.env.LOG_LEVEL || "info" });

export default logger;

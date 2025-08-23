const pino = require("pino");
const bus = require("./bus");

const isDev = process.env.NODE_ENV !== "production";

const logger = pino(
  isDev
    ? {
        level: "info",
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" }
        }
      }
    : { level: "info" }
);

// Helper d'audit (pousse aussi sur bus pour le temps réel)
logger.audit = (payload) => {
  const event = {
    ts: new Date().toISOString(),
    ...payload
  };
  logger.info({ audit: event }); // journalise
  bus.emit("audit", event); // et temps réel
};

module.exports = logger;

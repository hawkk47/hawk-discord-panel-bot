require("dotenv").config();
const logger = require("./shared/logger");
const { connectMongo } = require("./db/mongoose");
const bus = require("./shared/bus");

(async () => {
  try {
    await connectMongo();

    const bot = require("./bot/index");
    const client = await bot.start();

    const { startPanel, getIO } = require("./panel/server");
    await startPanel(client);

    // Émetteur de statut périodique (5s)
    setInterval(() => {
      const rssMB = Math.round(process.memoryUsage().rss / (1024 * 1024));
      const status = {
        ping: client.ws.ping ?? null,
        uptimeSec: Math.floor((client.uptime ?? 0) / 1000),
        guildCount: client.guilds.cache.size,
        rssMB
      };
      bus.emit("status", status);
    }, 5000);

    logger.info({ msg: "All services started (bot + panel + socket.io)" });
  } catch (err) {
    logger.error({ err }, "Fatal error during bootstrap");
    process.exit(1);
  }
})();

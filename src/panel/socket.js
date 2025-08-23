const { Server } = require("socket.io");
const { bus, get } = require("../shared/bus");
const logger = require("../shared/logger");

function attachSockets(httpServer, sessionMiddleware, discordClient) {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: process.env.BASE_URL, credentials: true }
  });

  // Partage de session avec Socket.IO
  io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

  io.on("connection", (socket) => {
    const sess = socket.request.session;
    const user = sess?.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // Room 'status' pour tous
    socket.join("status");

    // Abonnement aux guilds sur demande
    socket.on("guild:join", (guildId) => {
      socket.join(`guild:${guildId}`);
      // Backlog initial
      socket.emit("guild:logs:init", { guildId, logs: get(guildId, 50) });
    });

    socket.on("guild:leave", (guildId) => {
      socket.leave(`guild:${guildId}`);
    });
  });

  // Tick statut régulier
  setInterval(() => {
    const payload = {
      ping: discordClient?.ws?.ping ?? null,
      uptime: discordClient?.uptime ?? 0,
      guildCount: discordClient?.guilds?.cache?.size ?? 0,
      at: Date.now()
    };
    io.to("status").emit("status:update", payload);
  }, 5000);

  // Relais logs bus
  bus.on("log", ({ guildId, ts, type, msg, meta }) => {
    io.to(`guild:${guildId}`).emit("guild:log", { ts, type, msg, meta });
  });

  io.engine.on("connection_error", (err) => {
    logger.warn({ err }, "Socket.IO connection error");
  });

  return io;
}

module.exports = { attachSockets };

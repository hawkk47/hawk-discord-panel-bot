const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("../shared/logger");
const bus = require("../shared/bus");
const { setClient } = require("./services/botService");

let clientInstance = null;

function loadHandlers(client) {
  client.commands = new Collection();
  const commandsPath = path.join(__dirname, "commands");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  for (const f of files) {
    const cmd = require(path.join(commandsPath, f));
    client.commands.set(cmd.data.name, cmd);
  }

  client.on("ready", () => require("./events/ready")(client));
  client.on("interactionCreate", (...args) => require("./events/interactionCreate")(...args));

  client.on("guildCreate", (guild) => {
    logger.info({ guildId: guild.id, name: guild.name }, "Joined new guild");
    bus.emit("guild", { ts: new Date().toISOString(), type: "join", guildId: guild.id, name: guild.name });
  });
  client.on("guildDelete", (guild) => {
    logger.info({ guildId: guild.id, name: guild.name }, "Removed from guild");
    bus.emit("guild", { ts: new Date().toISOString(), type: "leave", guildId: guild.id, name: guild.name });
  });

  client.on("guildMemberAdd", (member) => {
    bus.emit("guild", { ts: new Date().toISOString(), type: "memberAdd", guildId: member.guild.id, userId: member.id });
  });
  client.on("guildMemberRemove", (member) => {
    bus.emit("guild", { ts: new Date().toISOString(), type: "memberRemove", guildId: member.guild.id, userId: member.id });
  });
}

async function start() {
  if (clientInstance) return clientInstance;
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.Channel]
  });
  loadHandlers(client);
  setClient(client);

  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN not set");

  await client.login(token);
  clientInstance = client;

  if (process.argv.includes("--register-only")) {
    setTimeout(async () => {
      logger.info("Register-only mode complete. Exiting.");
      process.exit(0);
    }, 5000);
  }

  return client;
}

function getClient() {
  if (!clientInstance) throw new Error("Client not started yet");
  return clientInstance;
}

module.exports = { start, getClient };

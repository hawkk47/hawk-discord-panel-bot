const logger = require("../../shared/logger");
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

async function registerCommands(client) {
  const commandsPath = path.join(__dirname, "..", "commands");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  const commandsData = files.map(f => require(path.join(commandsPath, f)).data.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const appId = process.env.DISCORD_CLIENT_ID;

  if (process.env.NODE_ENV !== "production") {
    // Guild scoped (dev): register to all guilds the bot is in
    for (const [guildId] of client.guilds.cache) {
      await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: commandsData });
      logger.info({ guildId }, "Registered guild slash commands (dev)");
    }
  } else {
    // Global (prod)
    await rest.put(Routes.applicationCommands(appId), { body: commandsData });
    logger.info("Registered global slash commands (prod)");
  }
}

module.exports = async (client) => {
  logger.info({ tag: client.user.tag }, "Bot ready");
  try {
    await registerCommands(client);
  } catch (err) {
    logger.error({ err }, "Failed to register commands");
  }
};

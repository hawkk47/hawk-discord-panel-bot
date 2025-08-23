const logger = require("../../shared/logger");

module.exports = async (guild) => {
  logger.info({ guildId: guild.id, name: guild.name }, "Joined new guild");
};

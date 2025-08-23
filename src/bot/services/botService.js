// Panel ↔ Bot bridge (same process)
const { ChannelType, PermissionsBitField } = require("discord.js");
const logger = require("../../shared/logger");

let clientRef = null;

function setClient(client) { clientRef = client; }
function getClient() { return clientRef; }

async function sendMessage(guildId, channelId, content) {
  const client = getClient();
  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(channelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Invalid channel");
  }
  const me = await guild.members.fetchMe();
  if (!me.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
    throw new Error("Bot lacks SendMessages in channel");
  }
  const msg = await channel.send({ content });
  logger.info({ guildId, channelId, messageId: msg.id }, "Message sent");
  return msg.id;
}

async function purgeMessages(guildId, channelId, count) {
  const client = getClient();
  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(channelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Invalid channel");
  }
  const me = await guild.members.fetchMe();
  if (!me.permissionsIn(channel).has(PermissionsBitField.Flags.ManageMessages)) {
    throw new Error("Bot lacks ManageMessages");
  }
  const deleted = await channel.bulkDelete(count, true);
  return deleted.size;
}

async function moderate(guildId, userId, action, options = {}) {
  const client = getClient();
  const guild = await client.guilds.fetch(guildId);
  const target = await guild.members.fetch(userId);

  const me = await guild.members.fetchMe();
  if (!me.permissions.has(PermissionsBitField.Flags.ModerateMembers) &&
      (action === "timeout")) {
    throw new Error("Bot lacks ModerateMembers");
  }
  if (!me.permissions.has(PermissionsBitField.Flags.KickMembers) && action === "kick") {
    throw new Error("Bot lacks KickMembers");
  }
  if (!me.permissions.has(PermissionsBitField.Flags.BanMembers) && action === "ban") {
    throw new Error("Bot lacks BanMembers");
  }

  if (action === "timeout") {
    const minutes = Math.min(Math.max(options.durationMinutes || 5, 1), 10080);
    const until = new Date(Date.now() + minutes * 60 * 1000);
    await target.timeout(until, options.reason || "Timeout via panel");
    return { action: "timeout", until: until.toISOString() };
  } else if (action === "kick") {
    await target.kick(options.reason || "Kick via panel");
    return { action: "kick" };
  } else if (action === "ban") {
    await target.ban({ reason: options.reason || "Ban via panel", deleteMessageSeconds: 0 });
    return { action: "ban" };
  }

  throw new Error("Unknown action");
}

module.exports = { setClient, getClient, sendMessage, purgeMessages, moderate };

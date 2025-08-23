const { push } = require("../../shared/bus");
module.exports = async (messages) => {
  try {
    const anyMsg = messages.first();
    if (!anyMsg) return;
    push(anyMsg.guild.id, "purge", `🧹 Purge ${messages.size} messages dans #${anyMsg.channel?.name}`, {
      channelId: anyMsg.channelId
    });
  } catch {}
};

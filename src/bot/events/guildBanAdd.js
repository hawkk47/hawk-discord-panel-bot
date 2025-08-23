const { push } = require("../../shared/bus");
module.exports = async (ban) => {
  push(ban.guild.id, "ban", `⛔️ ${ban.user.tag} banni`, { userId: ban.user.id });
};

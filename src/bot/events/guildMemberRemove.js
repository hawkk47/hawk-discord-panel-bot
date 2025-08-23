const { push } = require("../../shared/bus");
module.exports = async (member) => {
  push(member.guild.id, "member", `➖ ${member.user?.tag || member.id} a quitté`, { userId: member.id });
};

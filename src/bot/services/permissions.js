const { PermissionsBitField } = require("discord.js");

function hasManageGuild(member) {
  return member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
         member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function hasManageMessages(member) {
  return member.permissions.has(PermissionsBitField.Flags.ManageMessages);
}

function canModerate(executor, target) {
  // Executor must be higher role and not acting on self or owner
  if (!target || !executor) return false;
  if (target.id === executor.id) return false;
  if (target.roles?.highest?.position >= executor.roles?.highest?.position) return false;
  return true;
}

module.exports = { hasManageGuild, hasManageMessages, canModerate };

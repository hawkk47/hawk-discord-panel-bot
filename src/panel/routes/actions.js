const express = require("express");
const router = express.Router();
const { sendMessageSchema, purgeSchema, moderateSchema } = require("../../shared/validation");
const GuildConfig = require("../../db/models/GuildConfig");
const { sendMessage, purgeMessages, moderate } = require("../../bot/services/botService");
const { PermissionsBitField } = require("discord.js");
const { push } = require("../../shared/bus");

function ensureAdmin(req, res, next) {
  if (req.session?.panelUser?.role === "admin") return next();
  return res.status(403).render("error", { code: 403, message: "Accès admin requis." });
}

router.post("/:id/actions/send-message", ensureAdmin, async (req, res) => {
  const guildId = req.params.id;
  await assertAccess(req, guildId);

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) return bad(res, parsed.error.message);
  const { channelId, content } = parsed.data;

  try {
    const messageId = await sendMessage(guildId, channelId, content);
    push(guildId, "action", `Message envoyé dans <#${channelId}>`, {
      by: req.session.user.username,
      userId: req.session.user.id,
      messageId
    });
    return res.redirect(`/guilds/${guildId}`);
  } catch (e) {
    return bad(res, e.message);
  }
});

router.post("/:id/actions/purge", ensureAdmin, async (req, res) => {
  const guildId = req.params.id;
  await assertAccess(req, guildId);

  const parsed = purgeSchema.safeParse(req.body);
  if (!parsed.success) return bad(res, parsed.error.message);

  const cfg = await GuildConfig.findOne({ guildId }).lean();
  const max = cfg?.settings?.purgeLimitMax ?? 100;
  if (parsed.data.count > max) return bad(res, `Limit ${max}`);

  const client = req.discordClient;
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(req.session.user.id);
  const channel = await guild.channels.fetch(parsed.data.channelId);
  if (!member.permissionsIn(channel).has(PermissionsBitField.Flags.ManageMessages)) {
    return bad(res, "Vous n'avez pas la permission ManageMessages dans ce salon.");
  }

  try {
    const del = await purgeMessages(guildId, parsed.data.channelId, parsed.data.count);
    push(guildId, "action", `Purge ${del} messages dans <#${parsed.data.channelId}>`, {
      by: req.session.user.username,
      userId: req.session.user.id
    });
    return res.redirect(`/guilds/${guildId}`);
  } catch (e) {
    return bad(res, e.message);
  }
});

router.post("/:id/actions/moderate", ensureAdmin, async (req, res) => {
  const guildId = req.params.id;
  await assertAccess(req, guildId);

  const parsed = moderateSchema.safeParse(req.body);
  if (!parsed.success) return bad(res, parsed.error.message);

  const client = req.discordClient;
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(req.session.user.id);

  if (parsed.data.action === "timeout" && !member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
    return bad(res, "Permission ModerateMembers requise.");
  if (parsed.data.action === "kick" && !member.permissions.has(PermissionsBitField.Flags.KickMembers))
    return bad(res, "Permission KickMembers requise.");
  if (parsed.data.action === "ban" && !member.permissions.has(PermissionsBitField.Flags.BanMembers))
    return bad(res, "Permission BanMembers requise.");

  try {
    const result = await moderate(guildId, parsed.data.userId, parsed.data.action, {
      durationMinutes: parsed.data.durationMinutes,
      reason: parsed.data.reason
    });
    push(guildId, "action", `Modération ${parsed.data.action} sur <@${parsed.data.userId}>`, {
      by: req.session.user.username,
      userId: req.session.user.id,
      result
    });
    return res.redirect(`/guilds/${guildId}`);
  } catch (e) {
    return bad(res, e.message);
  }
});

async function assertAccess(req, guildId) {
  if (!req.session?.user) throw forbidden();
  const client = req.discordClient;
  const guild = client.guilds.cache.get(guildId);
  if (!guild) throw forbidden();
  try {
    const member = await guild.members.fetch(req.session.user.id);
    if (
      !member.permissions.has(PermissionsBitField.Flags.ManageGuild) &&
      !member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      throw forbidden();
    }
  } catch {
    throw forbidden();
  }
}
function forbidden() { const e = new Error("Forbidden"); e.status = 403; return e; }
function bad(res, msg) { return res.status(400).render("error", { code: 400, message: msg }); }

module.exports = router;

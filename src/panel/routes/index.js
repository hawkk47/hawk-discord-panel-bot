const express = require("express");
const router = express.Router();
const GuildConfig = require("../../db/models/GuildConfig");

function ensureAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect("/auth/login");
}

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const client = req.discordClient;

  const ping = client?.ws ? client.ws.ping : null;
  const uptime = client?.uptime ? Math.floor(client.uptime / 1000) : 0;
  const guildCount = client?.guilds?.cache?.size || 0;

  const userGuilds = await fetchUserGuilds(req);
  const allowedGuildIds = new Set(client.guilds.cache.map((g) => g.id));
  const manageable = userGuilds.filter((g) => allowedGuildIds.has(g.id) && hasManageGuildPerm(g.permissions));

  const configs = await GuildConfig.find({ guildId: { $in: manageable.map((g) => g.id) } }).lean();

  res.render("dashboard", { ping, uptime, guildCount, manageable, configs });
});

async function fetchUserGuilds(req) {
  if (!req.session?.oauth?.access_token) return [];
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${req.session.oauth.access_token}` }
  });
  if (!res.ok) return [];
  return res.json();
}

function hasManageGuildPerm(permStr) {
  const p = BigInt(permStr);
  const ADMIN = 0x8n;
  const MANAGE_GUILD = 0x20n;
  return (p & ADMIN) === ADMIN || (p & MANAGE_GUILD) === MANAGE_GUILD;
}

module.exports = router;

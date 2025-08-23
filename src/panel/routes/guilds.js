const express = require("express");
const router = express.Router();
const GuildConfig = require("../../db/models/GuildConfig");

// Garde auth déjà faite par server.js (ensureAuthenticated sur le prefix)

function hasManageGuildPerm(permStr) {
  try {
    const p = BigInt(permStr);
    const ADMIN = 0x8n;
    const MANAGE_GUILD = 0x20n;
    return (p & ADMIN) === ADMIN || (p & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

async function fetchUserGuilds(req) {
  if (!req.session?.oauth?.access_token) return [];
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${req.session.oauth.access_token}` }
  });
  if (!res.ok) return [];
  return res.json();
}

// PAGE: liste des guilds (UI)
router.get("/", async (req, res) => {
  const client = req.discordClient;
  const userGuilds = await fetchUserGuilds(req);
  const botGuildIds = new Set(client.guilds.cache.map((g) => g.id));
  const manageable = userGuilds.filter((g) => botGuildIds.has(g.id) && hasManageGuildPerm(g.permissions));
  res.render("guilds", { manageable });
});

// API JSON (si tu en as besoin côté client)
router.get(".json", async (req, res) => {
  const client = req.discordClient;
  const userGuilds = await fetchUserGuilds(req);
  const botGuildIds = new Set(client.guilds.cache.map((g) => g.id));
  const manageable = userGuilds.filter((g) => botGuildIds.has(g.id) && hasManageGuildPerm(g.permissions));
  res.json({ guilds: manageable });
});

// PAGE: détail d'une guild (UI)
router.get("/:id", async (req, res) => {
  const client = req.discordClient;
  const guildId = req.params.id;

  // vérifie que le bot est dans la guild
  if (!client.guilds.cache.has(guildId)) {
    return res.status(404).render("error", { code: 404, message: "Guild inconnue ou bot absent." });
  }

  // vérifie que l'utilisateur a le droit
  const userGuilds = await fetchUserGuilds(req);
  const me = userGuilds.find((g) => g.id === guildId);
  if (!me || !hasManageGuildPerm(me.permissions)) {
    return res.status(403).render("error", { code: 403, message: "Accès refusé à cette guild." });
  }

  // charge config
  let config = await GuildConfig.findOne({ guildId }).lean();
  if (!config) {
    config = await GuildConfig.create({
      guildId,
      modules: { moderation: false, logs: false, welcome: false, autorole: false },
      channels: {},
      roles: {},
      settings: { purgeLimitMax: 100, locale: "fr" }
    });
    config = config.toObject();
  }

  // passe un minimum d’infos à la vue
  const guild = client.guilds.cache.get(guildId);
  const model = {
    guild: { id: guild.id, name: guild.name, icon: guild.icon },
    config
  };

  res.render("guild", model);
});

module.exports = router;

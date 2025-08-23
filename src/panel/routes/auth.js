const express = require("express");
const router = express.Router();
const logger = require("../../shared/logger");
const PanelUser = require("../../db/models/PanelUser");

function discordAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds"
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

router.get("/login", (_req, res) => res.redirect(discordAuthUrl()));

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect("/auth/login");

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error("No access token");

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    const user = await userRes.json();

    let panelUser = await PanelUser.findOne({ userId: user.id });
    if (!panelUser) {
      const count = await PanelUser.countDocuments({});
      panelUser = await PanelUser.create({ userId: user.id, role: count === 0 ? "admin" : "viewer" });
    }

    req.session.user = {
      id: user.id,
      username: `${user.username}#${user.discriminator || "0"}`,
      avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null
    };
    req.session.oauth = { access_token: token.access_token };
    req.session.uiLocale = "fr";
    req.session.panelUser = { role: panelUser.role };

    logger.audit({ userId: user.id, action: "login", guildId: null, meta: { role: panelUser.role } });
    res.redirect("/dashboard");
  } catch (err) {
    logger.error({ err }, "OAuth callback failed");
    res.redirect("/auth/login");
  }
});

router.post("/logout", (req, res) => {
  const uid = req.session?.user?.id;
  if (uid) logger.audit({ userId: uid, action: "logout", guildId: null, meta: {} });
  req.session.destroy(() => res.redirect("/auth/login"));
});

module.exports = router;

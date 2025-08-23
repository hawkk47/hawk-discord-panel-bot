const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
const fs = require("fs/promises");
const expressLayouts = require("express-ejs-layouts");
const { Server } = require("socket.io");
const logger = require("../shared/logger");
const { t } = require("../shared/i18n");
const bus = require("../shared/bus");
const PanelUser = require("../db/models/PanelUser");

let discordClient = null;
let ioInstance = null;

function ensureAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect("/auth/login");
}

function setTemplateLocals(req, res, next) {
  res.locals.session = req.session;
  res.locals.csrfToken = () => { try { return req.csrfToken(); } catch { return null; } };
  res.locals.baseUrl = process.env.BASE_URL;
  res.locals.t = (key, vars) => t(req.session?.uiLocale || "fr", key, vars);
  res.locals.title = "Discord Panel";
  res.locals.isAdmin = req.session?.panelUser?.role === "admin";
  res.locals.toast = { ok: req.query.ok || null, err: req.query.err || null };
  res.locals.inviteUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
    process.env.DISCORD_CLIENT_ID || ""
  )}&scope=bot%20applications.commands&permissions=268561542`;
  next();
}

async function ensureLocalTailwindCSS() {
  const URL = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
  const publicDir = path.join(__dirname, "public");
  const cssPath = path.join(publicDir, "tailwind.min.css");
  try { await fs.access(cssPath); return; } catch {}
  try {
    await fs.mkdir(publicDir, { recursive: true });
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const css = await res.text();
    await fs.writeFile(cssPath, css, "utf8");
    console.log(`[tailwind] téléchargé -> ${cssPath}`);
  } catch (e) {
    console.warn("[tailwind] Échec du téléchargement. Place manuellement tailwind.min.css dans src/panel/public/", e.message);
  }
}

async function startPanel(client) {
  discordClient = client;
  const app = express();

  // CSP locale (pas de CDN requis pour CSS)
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://cdn.discordapp.com"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"],
        "font-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "form-action": ["'self'"]
      }
    }
  }));

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(expressLayouts);                      // <-- active les layouts
  app.set("layout", "layouts/main");            // <-- layout par défaut: views/layouts/main.ejs

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions"
  });
  app.use(session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 12
    }
  }));

  app.use(csrf());
  app.use("/static", express.static(path.join(__dirname, "public")));
  app.use(setTemplateLocals);

  const authLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true });
  app.use("/auth", authLimiter);
  const actionsLimiter = rateLimit({ windowMs: 10_000, max: 20, standardHeaders: true });
  app.use("/guilds/:id/actions", actionsLimiter);

  app.use((req, _res, next) => { req.discordClient = discordClient; next(); });

  await ensureLocalTailwindCSS();

  app.get("/", (req, res) => {
    if (!req.session?.user) return res.redirect("/auth/login");
    return res.redirect("/dashboard");
  });

  app.use("/auth", require("./routes/auth"));
  app.use("/", require("./routes/index"));
  app.use("/guilds", ensureAuthenticated, require("./routes/guilds"));
  app.use("/admin", ensureAuthenticated, require("./routes/admin"));

  app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
      logger.warn({ err }, "Invalid CSRF token");
      return res.status(403).render("error", { code: 403, message: "Invalid CSRF token" });
    }
    return next(err);
  });

  app.use((err, _req, res, _next) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).render("error", { code: 500, message: "Internal Server Error" });
  });

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: false } });
  ioInstance = io;

  const forward = (evt, payload) => io.emit(evt, payload);
  bus.on("status", (s) => forward("status", s));
  bus.on("audit", (a) => forward("audit", a));
  bus.on("guild", (g) => forward("guild", g));

  const port = Number(process.env.PORT) || 3000;
  await new Promise((resolve) => {
    server.listen(port, () => {
      logger.info({ port }, "Panel running (layouts + local Tailwind)");
      resolve();
    });
  });

  try {
    const count = await PanelUser.countDocuments({});
    if (count === 0) {
      logger.info("PanelUser empty: le premier utilisateur connecté deviendra admin automatiquement.");
    }
  } catch {}
}

function getIO() { return ioInstance; }

module.exports = { startPanel, getIO };

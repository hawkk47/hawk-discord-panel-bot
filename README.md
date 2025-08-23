# ⚡ Discord Bot + Web Panel

Un projet **open-source** combinant **bot Discord (discord.js v14)** et **panel web moderne (Express + EJS + Tailwind)** avec une **interface Glassmorphism** élégante et responsive.

> 🎨 **UI moderne & glassmorphism**  
> 🔑 **Connexion Discord OAuth2**  
> 🛡️ **Modules d’administration (purge, mute, ban, etc.)**  
> ⚡ **Actions en temps réel (via Socket.IO)**  
> 📂 **Config stockée en MongoDB (Mongoose)**  
> 🛠️ **Code simple et modulaire, prêt prod**

---

## 🚀 Démo (Aperçu UI)

![Dashboard Preview](/screenshot_dashboard.png)

---

## ✨ Fonctionnalités

### 🤖 Bot Discord
- Slash commands (`/ping`, `/say`, `/purge`, `/mute`, `/ban`, `/config`)
- Vérification des permissions
- Réponse rapide, logs et audit

### 🌐 Panel Web
- Connexion via **Discord OAuth2**
- Dashboard (statut bot, latence, uptime, RAM, guilds)
- Liste des serveurs accessibles (si `Manage Guild`)
- Config serveur persistée (MongoDB)
- Actions rapides (envoyer message, purge, modération)
- Logs en direct (Socket.IO)
- UI moderne **Glassmorphism** (Tailwind + CSS custom)

### 🔒 Sécurité
- Sessions sécurisées (cookies HttpOnly, Secure)
- Helmet + CSP
- CSRF tokens sur formulaires sensibles
- Validation stricte des inputs (zod/validator)
- Rate limiting sur routes sensibles

---

## 📦 Stack Technique

- **Node.js >= 20**
- [discord.js v14](https://discord.js.org/)
- [Express](https://expressjs.com/) + [EJS](https://ejs.co/)
- [TailwindCSS](https://tailwindcss.com/) (local build simplifié)
- [Mongoose](https://mongoosejs.com/) (MongoDB)
- [Socket.IO](https://socket.io/)
- [Helmet](https://helmetjs.github.io/) (CSP & headers de sécurité)
- ESLint + Prettier

---

## 🔧 Installation

### 1️⃣ Cloner le repo
```bash
git clone https://github.com/hawkk47/hawk-discord-panel-bot.git
cd hawk-discord-panel-bot
```
### 2️⃣ Mettre le callback sur discord
![Dev discord](/screenshot_discord.png)

### 3️⃣ Lancer le projet
```bash
Mode dev (avec nodemon + hot reload)
npm run dev
```

# Vous pouvez proposer des améliorations (:
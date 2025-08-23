// Ripple position
document.addEventListener("pointerdown", (e) => {
  const t = e.target.closest(".ripple");
  if (!t) return;
  const rect = t.getBoundingClientRect();
  t.style.setProperty("--x", (e.clientX - rect.left) + "px");
  t.style.setProperty("--y", (e.clientY - rect.top) + "px");
}, { passive: true });

// Search client (dashboard/guilds)
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search");
  const wrap = document.getElementById("guilds");
  if (input && wrap) {
    input.addEventListener("input", () => {
      const q = input.value.toLowerCase();
      Array.from(wrap.children).forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? "" : "none";
      });
    });
  }

  // Socket.IO live status
  if (window.io) {
    const socket = io();
    const wsPing = document.getElementById("wsPing");
    const uptime = document.getElementById("uptime");
    const mem = document.getElementById("mem");
    const tilePing = document.getElementById("tilePing");
    const tileUptime = document.getElementById("tileUptime");
    const tileMem = document.getElementById("tileMem");
    const tileGuilds = document.getElementById("tileGuilds");

    const fmt = (sec) => { const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60; return `${h}h ${m}m ${s}s`; };

    socket.on("status", (s) => {
      if (wsPing) wsPing.textContent = `${s.ping ?? "—"} ms`;
      if (uptime) uptime.textContent = fmt(s.uptimeSec || 0);
      if (mem) mem.textContent = `${s.rssMB} MB`;
      if (tilePing) tilePing.textContent = `${s.ping ?? "—"}`;
      if (tileUptime) tileUptime.textContent = fmt(s.uptimeSec || 0);
      if (tileMem) tileMem.textContent = `${s.rssMB} MB`;
      if (tileGuilds && typeof s.guildCount === "number") tileGuilds.textContent = s.guildCount;
    });

    const liveLog = document.getElementById("liveLog");
    const appendTicker = (list, text) => {
      if (!list) return;
      const li = document.createElement("li");
      li.className = "text-sm p-3 rounded-lg glass";
      li.textContent = text;
      list.prepend(li);
      while (list.children.length > 100) list.removeChild(list.lastChild);
    };

    socket.on("audit", (a) => {
      const text = `[AUDIT] ${a.ts} user:${a.userId} action:${a.action}${a.guildId ? " guild:"+a.guildId : ""}`;
      appendTicker(liveLog, text);
    });
    socket.on("guild", (g) => {
      const text = `[GUILD] ${g.ts} ${g.type} ${g.name || ""} (${g.guildId}) ${g.userId ? "user:"+g.userId : ""}`;
      appendTicker(liveLog, text);
    });
  }
});

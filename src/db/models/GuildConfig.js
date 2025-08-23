const mongoose = require("mongoose");

const GuildConfigSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    modules: {
      moderation: { type: Boolean, default: true },
      logs: { type: Boolean, default: false },
      welcome: { type: Boolean, default: false },
      autorole: { type: Boolean, default: false }
    },
    channels: {
      logsChannelId: { type: String, default: null },
      welcomeChannelId: { type: String, default: null }
    },
    roles: {
      muteRoleId: { type: String, default: null },
      autoRoleId: { type: String, default: null }
    },
    settings: {
      purgeLimitMax: { type: Number, default: 100, min: 1, max: 1000 },
      locale: { type: String, enum: ["fr", "en"], default: "fr" }
    },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: true, updatedAt: "updatedAt" } }
);

GuildConfigSchema.index({ guildId: 1 });

module.exports = mongoose.model("GuildConfig", GuildConfigSchema);

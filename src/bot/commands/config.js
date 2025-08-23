const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../../db/models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Lire/écrire une configuration simple")
    .addStringOption(o =>
      o.setName("action").setDescription("get/set").setRequired(true).addChoices(
        { name: "get", value: "get" }, { name: "set", value: "set" }
      )
    )
    .addStringOption(o => o.setName("key").setDescription("clé (settings.locale)").setRequired(true))
    .addStringOption(o => o.setName("value").setDescription("valeur (ex: fr|en)").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const action = interaction.options.getString("action", true);
    const key = interaction.options.getString("key", true);
    const value = interaction.options.getString("value");

    const guildId = interaction.guildId;
    const cfg = await GuildConfig.findOneAndUpdate(
      { guildId },
      { $setOnInsert: { guildId } },
      { new: true, upsert: true }
    );

    if (action === "get") {
      const current = key.split(".").reduce((o, k) => (o ? o[k] : undefined), cfg);
      await interaction.reply({ content: `\`${key}\` = \`${JSON.stringify(current)}\``, ephemeral: true });
    } else {
      // naive set only for settings.locale
      if (key === "settings.locale" && (value === "fr" || value === "en")) {
        cfg.settings.locale = value;
        await cfg.save();
        await interaction.reply({ content: "OK ✅", ephemeral: true });
      } else {
        await interaction.reply({ content: "Clé non supportée pour set ❌", ephemeral: true });
      }
    }
  }
};

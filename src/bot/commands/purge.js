const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Supprime un nombre de messages")
    .addIntegerOption(o => o.setName("count").setDescription("Nombre (1-100)").setMinValue(1).setMaxValue(100).setRequired(true))
    .addChannelOption(o => o.setName("channel").setDescription("Salon").addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const count = interaction.options.getInteger("count", true);
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const deleted = await channel.bulkDelete(count, true);
    await interaction.reply({ content: `Supprimé: ${deleted.size} messages ✅`, ephemeral: true });
  }
};

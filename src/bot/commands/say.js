const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Faire dire un message par le bot")
    .addStringOption(o => o.setName("message").setDescription("Contenu").setRequired(true))
    .addChannelOption(o => o.setName("channel").setDescription("Salon").addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const content = interaction.options.getString("message", true);
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    await channel.send({ content });
    await interaction.reply({ content: "Message envoyé ✅", ephemeral: true });
  }
};

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannir un utilisateur")
    .addUserOption(o => o.setName("user").setDescription("Utilisateur").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Raison"))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") || "Ban via /ban";
    const member = await interaction.guild.members.fetch(user.id);
    await member.ban({ reason });
    await interaction.reply({ content: `${user.tag} banni ✅`, ephemeral: true });
  }
};

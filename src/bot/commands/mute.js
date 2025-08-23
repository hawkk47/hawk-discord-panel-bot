const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout un utilisateur")
    .addUserOption(o => o.setName("user").setDescription("Utilisateur").setRequired(true))
    .addIntegerOption(o => o.setName("minutes").setDescription("Durée en minutes").setMinValue(1).setMaxValue(10080).setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Raison"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const minutes = interaction.options.getInteger("minutes", true);
    const reason = interaction.options.getString("reason") || "Mute via /mute";

    const member = await interaction.guild.members.fetch(user.id);
    const until = new Date(Date.now() + minutes * 60000);
    await member.timeout(until, reason);

    await interaction.reply({ content: `Timeout de ${user.tag} jusqu'à ${until.toISOString()} ✅`, ephemeral: true });
  }
};

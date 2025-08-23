const logger = require("../../shared/logger");

module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.client.commands.get(interaction.commandName);
  if (!cmd) {
    await interaction.reply({ content: "Commande introuvable.", ephemeral: true }).catch(() => {});
    return;
  }

  try {
    await cmd.execute(interaction);
  } catch (err) {
    logger.error({ err }, "Command execution failed");
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("Erreur lors de l'exécution de la commande.");
    } else {
      await interaction.reply({ content: "Erreur lors de l'exécution de la commande.", ephemeral: true });
    }
  }
};

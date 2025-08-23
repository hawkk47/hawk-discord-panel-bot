const { EmbedBuilder, Colors } = require("discord.js");

function okEmbed(desc) {
  return new EmbedBuilder().setColor(Colors.Green).setDescription(desc);
}
function errorEmbed(desc) {
  return new EmbedBuilder().setColor(Colors.Red).setDescription(desc);
}

module.exports = { okEmbed, errorEmbed };

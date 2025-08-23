const fr = require("./locales/fr.json");
const en = require("./locales/en.json");

const catalogs = { fr, en };

function t(locale = "fr", key, vars = {}) {
  const cat = catalogs[locale] || catalogs.fr;
  const template = key.split(".").reduce((o, k) => (o ? o[k] : undefined), cat) || key;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

module.exports = { t, catalogs };

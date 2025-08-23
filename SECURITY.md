# 🔐 Security Policy

## 📌 Supported Versions

Les versions suivantes du projet **hawk-discord-panel-bot** reçoivent encore des correctifs de sécurité :

| Version | Supportée ?         |
| ------- | ------------------- |
| 1.x.x   | ✅ Oui (maintenue)   |
| 0.x.x   | ❌ Non               |

⚠️ Les versions antérieures ne recevront **aucune mise à jour de sécurité**.  
Nous recommandons fortement de rester sur la branche `1.x.x`.

---

## 🛡️ Reporting a Vulnerability

Si tu découvres une faille de sécurité dans ce projet :

1. **Ne crée pas d’issue publique**.  
   Les issues GitHub sont visibles de tous et pourraient exposer la vulnérabilité.

2. **Contacte le mainteneur en privé** :  
   - Ouvre une **[GitHub Security Advisory](https://github.com/hawkk47/hawk-discord-panel-bot/security/advisories/new)**  
   - ou envoie un mail à : **hawk@hawk-network.ovh**

3. Fournis un maximum de détails :  
   - Version utilisée  
   - Étapes pour reproduire  
   - Impact potentiel (RCE, fuite de données, XSS, etc.)

---

## 🔄 Processus de réponse

- ⏱️ **Accusé de réception** : sous 48h après la soumission
- 🔎 **Analyse** : l’équipe reproduit et évalue l’impact
- 🛠️ **Correctif** : publié dans une release patch (par ex. `1.0.x`)
- 📢 **Communication** : tu seras tenu informé de l’avancement et crédité (si souhaité)

---

## ✅ Bonnes pratiques

- Utilise toujours la **dernière version stable**  
- Garde ton fichier `.env` privé et sécurisé  
- Ne partage jamais ton `DISCORD_TOKEN` ou `SESSION_SECRET` publiquement

const express = require("express");
const router = express.Router();
const PanelUser = require("../../db/models/PanelUser");

// Protection: connecté + admin
function ensureAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect("/auth/login");
}
function ensureAdmin(req, res, next) {
  if (req.session?.panelUser?.role === "admin") return next();
  return res.status(403).render("error", { code: 403, message: "Accès refusé" });
}

// Liste des utilisateurs du panel
router.get("/users", ensureAuthenticated, ensureAdmin, async (req, res) => {
  const users = await PanelUser.find({}).sort({ createdAt: 1 }).lean();
  res.render("admin_users", { users });
});

// Changer un rôle (admin/viewer)
router.post("/users/:userId/role", ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { userId } = req.params;
  const role = String(req.body.role || "").trim();
  if (!["admin", "viewer"].includes(role)) {
    return res.status(400).render("error", { code: 400, message: "Rôle invalide" });
  }
  const u = await PanelUser.findOneAndUpdate({ userId }, { role }, { new: true });
  if (!u) {
    return res.status(404).render("error", { code: 404, message: "Utilisateur introuvable" });
  }
  if (req.session.user?.id === userId) {
    req.session.panelUser = { role: u.role };
  }
  return res.redirect("/admin/users?ok=Rôle mis à jour");
});

module.exports = router;

function isPanelAdmin(req) {
  return req.session?.panelUser?.role === "admin";
}

function requirePanelAdmin(req, res, next) {
  if (isPanelAdmin(req)) return next();
  return res.status(403).render("error", { code: 403, message: "Accès réservé aux administrateurs." });
}

module.exports = { isPanelAdmin, requirePanelAdmin };

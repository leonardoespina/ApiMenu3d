const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticados." });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      console.log("req.user.rol:", req.user.rol);
      console.log("allowedRoles:", allowedRoles);

      return res.status(403).json({ error: "No autorizado." });
    }
    next();
  };
};

module.exports = { permit };

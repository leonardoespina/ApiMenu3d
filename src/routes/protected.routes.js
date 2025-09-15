const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit } = require("../middlewares/role.middleware");

router.get(
  "/cliente-only",
  authenticateToken,
  permit("cliente", "admin", "superadmin"),
  (req, res) => {
    res.json({
      message: `Hola ${req.user.rol}, esta ruta es para clientes y superiores.`,
    });
  }
);

router.get(
  "/admin-only",
  authenticateToken,
  permit("admin", "superadmin"),
  (req, res) => {
    res.json({
      message: `Hola ${req.user.rol}, esta ruta es solo para administradores.`,
    });
  }
);

router.get(
  "/superadmin-only",
  authenticateToken,
  permit("superadmin"),
  (req, res) => {
    res.json({
      message: `Hola ${req.user.rol}, esta ruta es solo para superadministradores.`,
    });
  }
);

module.exports = router;

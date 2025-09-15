const router = require("express").Router();
const empresaController = require("../controllers/empresaController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit } = require("../middlewares/role.middleware");

router.get("/", empresaController.getEmpresa);
router.get(
  "/historial",
  authenticateToken,
  permit("admin", "superadmin"),
  empresaController.getEmpresasHistory
);
router.post(
  "/",
  authenticateToken,
  permit("admin", "superadmin"),
  empresaController.createEmpresa
);
router.put(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  empresaController.updateEmpresa
);
router.delete(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  empresaController.deleteEmpresa
);

module.exports = router;

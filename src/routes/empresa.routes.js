const router = require("express").Router();
const empresaController = require("../controllers/empresaController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/", empresaController.getEmpresas);
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
  upload.single("logo"),
  empresaController.createEmpresa
);
router.put(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  upload.single("logo"),
  empresaController.updateEmpresa
);
router.delete(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  empresaController.deleteEmpresa
);

module.exports = router;

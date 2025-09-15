const router = require("express").Router();
const bancoController = require("../controllers/bancoController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit } = require("../middlewares/role.middleware");

router.get("/", bancoController.getAllBancos);
router.get("/:id", bancoController.getBancoById);
router.post(
  "/",
  authenticateToken,
  permit("admin", "superadmin"),
  bancoController.createBanco
);
router.put(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  bancoController.updateBanco
);
router.delete(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  bancoController.deleteBanco
);

module.exports = router;

const router = require("express").Router();
const categoriaController = require("../controllers/categoriaController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit } = require("../middlewares/role.middleware");

router.get("/", categoriaController.getAllCategorias);
router.post(
  "/",
  authenticateToken,
  permit("admin", "superadmin"),
  categoriaController.createCategoria
);
router.put(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  categoriaController.updateCategoria
);
router.delete(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  categoriaController.deleteCategoria
);

module.exports = router;

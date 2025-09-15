const Categoria = require("../models/Categoria");
const { paginateAndSearch } = require("../utils/paginationHelper");

exports.getAllCategorias = async (req, res) => {
  try {
    const searchFields = ["nombre", "descripcion"];
    const options = {
      where: { status: true },
    };

    const results = await paginateAndSearch(
      Categoria,
      req.query,
      searchFields,
      options
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

exports.createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const categoria = await Categoria.create({ nombre, descripcion });
    res.status(201).json(categoria);
  } catch (err) {
    res.status(500).json({ error: "Error al crear la categoría" });
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findByPk(id);
    if (!categoria || !categoria.status)
      return res.status(404).json({ error: "Categoría no encontrada" });

    await categoria.update({ nombre, descripcion });
    res.json({ message: "Categoría actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
};

/*exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    if (!categoria || !categoria.status)
      return res.status(404).json({ error: "Categoría no encontrada" });

    await .update({
      status: false,
      deletedAt: new Date(),
      deletedBy: req.usuario.id,
    });

    res.json({ message: "Categoría eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};*/

exports.deleteCategoria = async (req, res) => {
  console.log("Eliminando Categoria con ID:", req.user);
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria || !categoria.status) {
      return res.status(404).json({ error: "Categoria no encontrado." });
    }

    // Corregido: usar req.user en lugar de req.usuario
    // y verificar que el usuario exista en la solicitud.
    const deletedBy = req.user ? req.user.id : null;
    if (!deletedBy) {
      return res.status(401).json({
        error: "No se pudo identificar al usuario para la operación.",
      });
    }

    await categoria.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: deletedBy,
    });

    res.json({ message: "Categoria eliminado correctamente." });
  } catch (error) {
    console.error("Error detallado al eliminar el Categoria:", error);
    res.status(500).json({ error: "Error al eliminar el Categoria." });
  }
};

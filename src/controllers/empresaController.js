const Empresa = require("../models/Empresa");

// Obtener todos los registros de empresa (solo uno activo debería existir)
exports.getEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findOne({ where: { status: true } });

    if (!empresa) {
      return res.status(404).json({
        error: "Datos de empresa no configurados",
        configurado: false,
      });
    }

    res.json({
      ...empresa.toJSON(),
      configurado: true,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los datos de la empresa" });
  }
};

// Crear nueva empresa (solo debería haber una activa)
exports.createEmpresa = async (req, res) => {
  try {
    const { nombre, direccion, telefono, rif } = req.body;

    // Verificar si ya existe una empresa activa
    const empresaExistente = await Empresa.findOne({ where: { status: true } });
    if (empresaExistente) {
      return res.status(400).json({
        error:
          "Ya existe una empresa configurada. Actualice la existente o elimínela primero.",
      });
    }

    const empresa = await Empresa.create({ nombre, direccion, telefono, rif });
    res.status(201).json(empresa);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El RIF o nombre ya existen" });
    }
    res.status(500).json({ error: "Error al crear los datos de la empresa" });
  }
};

// Actualizar datos de la empresa
exports.updateEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, rif } = req.body;

    const empresa = await Empresa.findByPk(id);
    if (!empresa || !empresa.status) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    await empresa.update({ nombre, direccion, telefono, rif });
    res.json({ message: "Datos de empresa actualizados correctamente" });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El RIF o nombre ya existen" });
    }
    res
      .status(500)
      .json({ error: "Error al actualizar los datos de la empresa" });
  }
};

// Eliminar empresa (soft delete)
exports.deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa || !empresa.status) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    await empresa.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: req.usuario.id,
    });

    res.json({ message: "Empresa eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la empresa" });
  }
};

// Obtener historial de empresas (incluyendo eliminadas)
exports.getEmpresasHistory = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(empresas);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al obtener el historial de empresas" });
  }
};

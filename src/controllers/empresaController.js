const Empresa = require("../models/Empresa");
const upload = require("../middlewares/upload.middleware"); // Assuming upload.middleware.js is in the same directory or adjust path
const fs = require("fs").promises;
const path = require("path");

// Obtener todos los registros de empresa (solo uno activo debería existir)
exports.getEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findAll({ where: { status: true } });
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los bancos" });
  }
};

// Crear nueva empresa (solo debería haber una activa)
exports.createEmpresa = [
  upload.single("logo"), // Apply multer middleware for 'logo' field
  async (req, res) => {
    try {
      const { nombre, direccion, telefono, rif } = req.body;
      const logoFilename = req.file ? req.file.filename : null;

      // Verificar si ya existe una empresa activa
      const empresaExistente = await Empresa.findOne({
        where: { status: true },
      });
      if (empresaExistente) {
        // If a file was uploaded, delete it as it's not needed
        if (req.file) {
          await fs.unlink(
            path.join(__dirname, "../../uploads", req.file.filename)
          );
        }
        return res.status(400).json({
          error:
            "Ya existe una empresa configurada. Actualice la existente o elimínela primero.",
        });
      }

      // Basic validation for required fields
      if (!nombre || !direccion || !telefono || !rif) {
        // Delete uploaded file if required fields are missing
        if (req.file) {
          await fs.unlink(
            path.join(__dirname, "../../uploads", req.file.filename)
          );
        }
        return res
          .status(400)
          .json({ error: "Campos obligatorios faltantes." });
      }

      const empresa = await Empresa.create({
        nombre,
        direccion,
        telefono,
        rif,
        logo: logoFilename, // Add logo attribute
      });
      res.status(201).json(empresa);
    } catch (err) {
      // If an error occurs during creation and a file was uploaded, delete it
      if (req.file) {
        try {
          await fs.unlink(
            path.join(__dirname, "../../uploads", req.file.filename)
          );
        } catch (unlinkErr) {
          console.error(
            "Error deleting uploaded logo after creation error:",
            unlinkErr
          );
        }
      }
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "El RIF o nombre ya existen" });
      }
      res.status(500).json({ error: "Error al crear los datos de la empresa" });
    }
  },
];

// Actualizar datos de la empresa
exports.updateEmpresa = [
  upload.single("logo"), // Apply multer middleware for 'logo' field
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, direccion, telefono, rif } = req.body;
      const logoFilename = req.file ? req.file.filename : null;

      const empresa = await Empresa.findByPk(id);
      if (!empresa || !empresa.status) {
        // If company not found and a file was uploaded, delete it
        if (req.file) {
          await fs.unlink(
            path.join(__dirname, "../../uploads", req.file.filename)
          );
        }
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      const oldLogo = empresa.logo;

      // Update company data
      await empresa.update({
        nombre,
        direccion,
        telefono,
        rif,
        logo: logoFilename || oldLogo, // Use new logo if provided, otherwise keep old one
      });

      // If a new logo was uploaded and an old one existed, delete the old one
      if (req.file && oldLogo) {
        try {
          await fs.unlink(path.join(__dirname, "../../uploads", oldLogo));
        } catch (err) {
          console.error("Error deleting old logo:", err.message);
          // Do not fail the request if old logo deletion fails, as update was successful
        }
      }

      res.json({ message: "Datos de empresa actualizados correctamente" });
    } catch (err) {
      // If an error occurs during update and a new file was uploaded, delete it
      if (req.file) {
        try {
          await fs.unlink(
            path.join(__dirname, "../../uploads", req.file.filename)
          );
        } catch (unlinkErr) {
          console.error(
            "Error deleting uploaded logo after update error:",
            unlinkErr
          );
        }
      }
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "El RIF o nombre ya existen" });
      }
      res
        .status(500)
        .json({ error: "Error al actualizar los datos de la empresa" });
    }
  },
];

// Eliminar empresa (soft delete)
exports.deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa || !empresa.status) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    // If deleting, we should also consider deleting the logo file
    const logoToDelete = empresa.logo;

    await empresa.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: req.usuario.id,
    });

    // Attempt to delete the logo file if it exists
    if (logoToDelete) {
      try {
        const logoPath = path.join(__dirname, "../../uploads", logoToDelete);
        await fs.unlink(logoPath);
        console.log(`Logo file ${logoToDelete} deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting logo file ${logoToDelete}:`, err.message);
      }
    }

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

const { Empresa } = require("../models");
const { paginateAndSearch } = require("../utils/paginationHelper");
const storageService = require("../services/storageService");

/*const getEmpresas = async (req, res) => {
  console.log("Obteniendo empresas con parámetros:", req.query);
  try {
    const data = await paginateAndSearch(
      Empresa,
      req.query,
      ["nombre", "rif", "direccion", "telefono"],
      {
        where: { status: true },
      }
    );

    console.log("Empresas encontradas:", data.data.length);
    res.json(data);
  } catch (error) {
    console.error("Error en getEmpresas:", error);
    res.status(500).json({ error: "Error al obtener las empresas." });
  }
};*/

const getEmpresas = async (req, res) => {
  //console.log("Query parameters:", req);
  try {
    const empresa = await Empresa.findAll({ where: { status: true } });

    res.json(empresa);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener empresa" });
  }
};

const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findOne({
      where: { id, status: true },
    });

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    res.json(empresa);
  } catch (error) {
    console.error("Error al obtener la empresa:", error);
    res.status(500).json({ error: "Error al obtener la empresa." });
  }
};

const createEmpresa = async (req, res) => {
  console.log("Creando empresa con datos:", req.body);
  try {
    const { nombre, direccion, telefono, rif } = req.body;

    if (!nombre || !direccion || !telefono || !rif) {
      return res.status(400).json({ error: "Campos obligatorios faltantes." });
    }

    // Verificar si ya existe una empresa activa
    const empresaExistente = await Empresa.findOne({ where: { status: true } });
    if (empresaExistente) {
      return res.status(400).json({
        error:
          "Ya existe una empresa configurada. Actualice la existente o elimínela primero.",
      });
    }

    let logoData = null;

    // Subir logo a Supabase si existe
    if (req.file) {
      const fileName = storageService.generateUniqueFileName(
        req.file.originalname
      );
      logoData = await storageService.uploadFile(req.file, fileName);
    }

    const empresa = await Empresa.create({
      nombre,
      direccion,
      telefono,
      rif,
      imagen: logoData ? logoData.fileName : null,
    });

    res.status(201).json({
      message: "Empresa creada exitosamente.",
      ...empresa.toJSON(),
    });
  } catch (error) {
    console.error("--- ERROR DETALLADO AL CREAR EMPRESA ---");
    console.error("Mensaje:", error.message);
    console.error("Nombre:", error.name);
    console.error("Stack:", error.stack);
    console.error("--- FIN DEL ERROR ---");

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El RIF o nombre ya existen" });
    }
    res.status(500).json({ error: "Error al crear la empresa." });
  }
};

const updateEmpresa = async (req, res) => {
  console.log("Creando empresa con datos:", req.body);
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, rif } = req.body;

    const empresa = await Empresa.findByPk(id);
    if (!empresa || !empresa.status) {
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    const oldLogo = empresa.imagen;
    let newLogo = empresa.imagen;

    // Subir nuevo logo a Supabase si existe
    if (req.file) {
      const fileName = storageService.generateUniqueFileName(
        req.file.originalname
      );
      const logoData = await storageService.uploadFile(req.file, fileName);
      newLogo = logoData.fileName;

      // Eliminar logo antiguo de Supabase
      if (oldLogo) {
        await storageService.deleteFile(oldLogo);
      }
    }

    // Actualizar la empresa en la base de datos
    await empresa.update({
      nombre,
      direccion,
      telefono,
      rif,
      imagen: newLogo,
    });

    res.json(empresa);
  } catch (error) {
    console.error("--- ERROR DETALLADO AL ACTUALIZAR EMPRESA ---");
    console.error("Mensaje:", error.message);
    console.error("Nombre:", error.name);
    console.error("Stack:", error.stack);
    console.error("--- FIN DEL ERROR ---");

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El RIF o nombre ya existen" });
    }
    res.status(500).json({ error: "Error al actualizar la empresa." });
  }
};

const deleteEmpresa = async (req, res) => {
  console.log("Eliminando empresa con ID:", req.params.id);
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    if (!empresa || !empresa.status) {
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    const deletedBy = req.user ? req.user.id : null;
    if (!deletedBy) {
      return res.status(401).json({
        error: "No se pudo identificar al usuario para la operación.",
      });
    }

    const logoParaEliminar = empresa.imagen;

    // Actualizar la empresa a status: false (borrado lógico)
    await empresa.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: deletedBy,
    });

    // Eliminar logo de Supabase Storage si existe
    if (logoParaEliminar) {
      await storageService.deleteFile(logoParaEliminar);
    }

    res.json({ message: "Empresa eliminada correctamente." });
  } catch (error) {
    console.error("Error detallado al eliminar la empresa:", error);
    res.status(500).json({ error: "Error al eliminar la empresa." });
  }
};

const getEmpresasHistory = async (req, res) => {
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

module.exports = {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresasHistory,
};
/*const { Empresa } = require("../models");
const { paginateAndSearch } = require("../utils/paginationHelper");
const fs = require("fs").promises;
const path = require("path");

const getEmpresas = async (req, res) => {
  //console.log("Query parameters:", req);
  try {
    const empresa = await Empresa.findAll({ where: { status: true } });

    res.json(empresa);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener empresa" });
  }
 
};

const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findOne({
      where: { id, status: true },
    });

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    res.json(empresa);
  } catch (error) {
    console.error("Error al obtener la empresa:", error);
    res.status(500).json({ error: "Error al obtener la empresa." });
  }
};

const createEmpresa = async (req, res) => {
  console.log(req.body);
  try {
    const { nombre, direccion, telefono, rif } = req.body;

    if (!nombre || !direccion || !telefono || !rif) {
      if (req.file) {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      }
      return res.status(400).json({ error: "Campos obligatorios faltantes." });
    }

    const empresaExistente = await Empresa.findOne({ where: { status: true } });
    if (empresaExistente) {
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

    const empresa = await Empresa.create({
      nombre,
      direccion,
      telefono,
      rif,
      logo: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      message: "Empresa creada exitosamente.",
      ...empresa.toJSON(),
    });
  } catch (error) {
    console.error("Error al crear la empresa:", error);
    if (req.file) {
      try {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      } catch (err) {
        console.error("No se pudo eliminar el logo subido:", err.message);
      }
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El RIF o nombre ya existen" });
    }
    res.status(500).json({ error: "Error al crear la empresa." });
  }
};

const updateEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, rif } = req.body;

    const empresa = await Empresa.findByPk(id);
    if (!empresa || !empresa.status) {
      if (req.file) {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      }
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    const oldLogo = empresa.logo;

    await empresa.update({
      nombre,
      direccion,
      telefono,
      rif,
      logo: req.file ? req.file.filename : empresa.logo,
    });

    if (req.file && oldLogo) {
      try {
        await fs.unlink(path.join(__dirname, "../../uploads", oldLogo));
      } catch (err) {
        console.error("No se pudo eliminar el logo anterior:", err.message);
      }
    }

    res.json(empresa);
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      } catch (err) {
        console.error(
          "No se pudo eliminar el logo subido tras un error en la actualización:",
          err.message
        );
      }
    }
    console.error("Error al actualizar la empresa:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El RIF o nombre ya existen" });
    }
    res.status(500).json({ error: "Error al actualizar la empresa." });
  }
};

const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa || !empresa.status) {
      return res.status(404).json({ error: "Empresa no encontrada." });
    }

    const deletedBy = req.user ? req.user.id : null;
    if (!deletedBy) {
      return res.status(401).json({
        error: "No se pudo identificar al usuario para la operación.",
      });
    }

    const logoParaEliminar = empresa.logo;

    await empresa.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: deletedBy,
    });

    if (logoParaEliminar) {
      try {
        const rutaLogo = path.join(
          __dirname,
          "../../uploads",
          logoParaEliminar
        );
        await fs.unlink(rutaLogo);
        console.log(`Logo ${logoParaEliminar} eliminado exitosamente.`);
      } catch (err) {
        console.error(
          `Error al eliminar el logo ${logoParaEliminar}:`,
          err.message
        );
      }
    }

    res.json({ message: "Empresa eliminada correctamente." });
  } catch (error) {
    console.error("Error detallado al eliminar la empresa:", error);
    res.status(500).json({ error: "Error al eliminar la empresa." });
  }
};

const getEmpresasHistory = async (req, res) => {
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

module.exports = {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresasHistory,
};*/

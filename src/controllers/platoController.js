const { Plato, Categoria } = require("../models");
const { paginateAndSearch } = require("../utils/paginationHelper");
const fs = require("fs").promises;
const path = require("path");

const getPlatoById = async (req, res) => {
  try {
    const { id } = req.params;
    const plato = await Plato.findOne({
      where: { id, status: true },
      include: [{ model: Categoria, attributes: ["nombre"] }],
    });

    if (!plato) {
      return res.status(404).json({ error: "Plato no encontrado." });
    }

    res.json(plato);
  } catch (error) {
    console.error("Error al obtener el plato:", error);
    res.status(500).json({ error: "Error al obtener el plato." });
  }
};

/*const getPlatos = async (req, res) => {
  console.log("Obteniendo platos con parámetros:", req.query);
  try {
    const { category, search } = req.query;

    // Configuración de la inclusión de modelos y filtros
    let includeOptions = [{ model: Categoria, attributes: ["nombre"] }];
    if (category) {
      includeOptions[0].where = { nombre: category };
      includeOptions[0].required = true; // Esto asegura que se realice un INNER JOIN
    }

    const data = await paginateAndSearch(
      Plato,
      req.query,
      ["nombre", "descripcion"],
      {
        where: { status: true },
        include: includeOptions,
      }
    );
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los platos." });
  }
};*/
const getPlatos = async (req, res) => {
  console.log("Obteniendo platos con parámetros:", req.query);
  try {
    const { category, search } = req.query;

    let where = { status: true };
    let includeOptions = [
      {
        model: Categoria,
        attributes: ["id", "nombre"],
        required: false,
      },
    ];

    if (category && category !== "All") {
      where.categoriaId = category;
      includeOptions[0].required = true;
    }

    const data = await paginateAndSearch(
      Plato,
      req.query,
      ["nombre", "descripcion"],
      {
        where: where,
        include: includeOptions,
      }
    );

    // Transformar la respuesta después de obtener los datos
    const transformedData = {
      ...data,
      data: data.data.map((plato) => {
        const platoJson = plato.toJSON ? plato.toJSON() : plato;
        const { Categorium, ...rest } = platoJson;

        return {
          ...rest,
          categoriaId: Categorium?.id,
          categoriaNombre: Categorium?.nombre,
        };
      }),
    };

    console.log("Platos encontrados:", transformedData.data.length);
    res.json(transformedData);
  } catch (error) {
    console.error("Error en getPlatos:", error);
    res.status(500).json({ error: "Error al obtener los platos." });
  }
};

/*const getPlatoById = async (req, res) => {
  try {
    const { id } = req.params;
    const plato = await Plato.findOne({
      where: { id, status: true },
      include: [{ model: Categoria, attributes: ["nombre"] }],
    });

    if (!plato) {
      return res.status(404).json({ error: "Plato no encontrado." });
    }

    res.json(plato);
  } catch (error) {
    console.error("Error al obtener el plato:", error);
    res.status(500).json({ error: "Error al obtener el plato." });
  }
};

const getPlatos = async (req, res) => {
  console.log("Obteniendo platos con parámetros:", req.query);
  try {
    const { category, search } = req.query;
    let where = { status: true };

    if (category) {
      where["$Categoria.nombre$"] = category;
    }

    const data = await paginateAndSearch(
      Plato,
      req.query,
      ["nombre", "descripcion"],
      {
        where: where,
        include: [{ model: Categoria, attributes: ["nombre"] }],
      }
    );
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los platos." });
  }
};*/

/*const createPlato = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoriaId } = req.body;

    console.log("Datos del plato:", {
      nombre,
      descripcion,
      precio,
      categoriaId,
    });

    if (!nombre || !precio || !categoriaId)
      return res.status(400).json({ error: "Campos obligatorios faltantes." });

    const plato = await Plato.create({
      nombre,
      descripcion,
      precio,
      categoriaId,
      imagen: req.file ? req.file.filename : null,
      //createdBy: req.usuario.id,
    });

    res.status(201).json(plato);
  } catch (error) {
    console.error("Error al crear el plato:", error);
    res.status(500).json({ error: "Error al crear el plato." });
  }
};*/
const createPlato = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoriaId } = req.body;

    console.log("Datos del plato:", {
      nombre,
      descripcion,
      precio,
      categoriaId,
    });

    if (!nombre || !precio || !categoriaId) {
      // Eliminar imagen si ya se subió pero faltan campos
      if (req.file) {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      }
      return res.status(400).json({ error: "Campos obligatorios faltantes." });
    }

    const plato = await Plato.create({
      nombre,
      descripcion,
      precio,
      categoriaId,
      imagen: req.file ? req.file.filename : null,
      // createdBy: req.usuario.id,
    });

    // Enviar una respuesta con un mensaje de éxito
    res.status(201).json({
      message: "Plato creado exitosamente.",
      ...plato.toJSON(), // Opcionalmente, puedes devolver el objeto del plato creado
    });
  } catch (error) {
    console.error("Error al crear el plato:", error);

    // Eliminar la imagen si hubo un error y se subió
    if (req.file) {
      try {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      } catch (err) {
        console.error("No se pudo eliminar la imagen subida:", err.message);
      }
    }

    res.status(500).json({ error: "Error al crear el plato." });
  }
};

const updatePlato = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoriaId } = req.body;

    const plato = await Plato.findByPk(id);
    if (!plato || !plato.status) {
      // Si el plato no se encuentra, y se subió un archivo, hay que eliminarlo
      if (req.file) {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      }
      return res.status(404).json({ error: "Plato no encontrado." });
    }

    const oldImagen = plato.imagen;

    // Actualizar el plato en la base de datos
    await plato.update({
      nombre,
      descripcion,
      precio,
      categoriaId,
      imagen: req.file ? req.file.filename : plato.imagen,
      // updatedBy: req.usuario.id,
    });

    // Si se subió una nueva imagen y existía una antigua, eliminar la antigua
    if (req.file && oldImagen) {
      try {
        await fs.unlink(path.join(__dirname, "../../uploads", oldImagen));
      } catch (err) {
        // Opcional: registrar que no se pudo eliminar el archivo antiguo,
        // pero no fallar la solicitud ya que la actualización fue exitosa.
        console.error("No se pudo eliminar la imagen anterior:", err.message);
      }
    }

    res.json(plato);
  } catch (error) {
    // Si ocurre un error durante la actualización, y se subió un nuevo archivo,
    // es buena práctica eliminarlo para no dejar archivos huérfanos.
    if (req.file) {
      try {
        await fs.unlink(
          path.join(__dirname, "../../uploads", req.file.filename)
        );
      } catch (err) {
        console.error(
          "No se pudo eliminar la imagen subida tras un error en la actualización:",
          err.message
        );
      }
    }
    console.error("Error al actualizar el plato:", error);
    res.status(500).json({ error: "Error al actualizar el plato." });
  }
};

const deletePlato = async (req, res) => {
  console.log("Eliminando plato con ID:", req.params.id);
  try {
    const plato = await Plato.findByPk(req.params.id);
    if (!plato || !plato.status) {
      return res.status(404).json({ error: "Plato no encontrado." });
    }

    const deletedBy = req.user ? req.user.id : null;
    if (!deletedBy) {
      return res.status(401).json({
        error: "No se pudo identificar al usuario para la operación.",
      });
    }

    const imagenParaEliminar = plato.imagen; // Guardar el nombre de la imagen

    // Actualizar el plato a status: false (borrado lógico)
    await plato.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: deletedBy,
    });

    // Si el plato tenía una imagen, intentar eliminarla del sistema de archivos
    if (imagenParaEliminar) {
      try {
        const rutaImagen = path.join(
          __dirname,
          "../../uploads",
          imagenParaEliminar
        );
        await fs.unlink(rutaImagen);
        console.log(`Imagen ${imagenParaEliminar} eliminada exitosamente.`);
      } catch (err) {
        // Si hay un error al eliminar el archivo (ej. no existe), solo se registra.
        // La operación principal de borrado lógico ya fue exitosa.
        console.error(
          `Error al eliminar la imagen ${imagenParaEliminar}:`,
          err.message
        );
      }
    }

    res.json({ message: "Plato eliminado correctamente." });
  } catch (error) {
    console.error("Error detallado al eliminar el plato:", error);
    res.status(500).json({ error: "Error al eliminar el plato." });
  }
};

module.exports = {
  getPlatos,
  createPlato,
  updatePlato,
  deletePlato,
  getPlatoById,
};

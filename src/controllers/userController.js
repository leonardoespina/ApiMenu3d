const { Usuario } = require("../models");
const { paginateAndSearch } = require("../utils/paginationHelper");
const bcrypt = require("bcryptjs");

// 🔍 Obtener todos los usuarios con paginación y búsqueda
const getUsers = async (req, res) => {
  try {
    const result = await paginateAndSearch(
      Usuario,
      req.query,
      ["nombre", "correo", "cedula"],
      {
        where: { status: true },
        attributes: { exclude: ["password"] },
      }
    );

    res.json(result);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios." });
  }
};

// 📄 Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await Usuario.findOne({
      where: { id: req.params.id, status: true },
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el usuario." });
  }
};

// ✨ Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { nombre, cedula, telefono, correo, direccion, password, rol } =
      req.body;

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({
      where: { correo },
    });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado." });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const newUser = await Usuario.create({
      nombre,
      cedula,
      telefono,
      correo,
      direccion,
      password: hashedPassword,
      rol,
      //createdBy: req.usuario.id, // Descomentar si se usa autenticación
    });

    // Excluir la contraseña de la respuesta
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res.status(500).json({ error: "Error al crear el usuario." });
  }
};

// ✏️ Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { nombre, cedula, telefono, correo, direccion, password, rol } =
      req.body;

    const user = await Usuario.findByPk(req.params.id);
    if (!user || !user.status)
      return res.status(404).json({ error: "Usuario no encontrado." });

    const updateData = {
      nombre,
      cedula,
      telefono,
      correo,
      direccion,
      rol,
      //updatedBy: req.usuario.id,
    };

    if (password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(password, salt);
    }

    await user.update(updateData);

    res.json({ message: "Usuario actualizado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario." });
  }
};

// 🗑️ Eliminar lógicamente un usuario
const deleteUser = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id);
    if (!user || !user.status)
      return res.status(404).json({ error: "Usuario no encontrado." });

    await user.update({
      status: false,
      deletedAt: new Date(),
      //deletedBy: req.usuario.id,
    });

    res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario." });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

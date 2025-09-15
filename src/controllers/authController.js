const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sanitizeObject } = require("../utils/sanitize");

const register = async (req, res) => {
  try {
    const data = sanitizeObject(req.body);

    const { nombre, cedula, telefono, correo, direccion, password } = data;

    // Validar campos requeridos
    if (!nombre || !cedula || !telefono || !correo || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    // Validar existencia previa
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(409).json({ error: "El correo ya está registrado." });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre,
      cedula,
      telefono,
      correo,
      direccion,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    res.status(500).json({ error: "Error al registrar usuario." });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = sanitizeObject(req.body);

    // console.log("Datos de inicio de sesión:", { correo, password });
    // const usuario = await Usuario.findOne({ where: { correo, status: true } });
    //console.log("Usuario encontrado:", usuario);

    const usuario = await Usuario.findOne({ where: { correo } });
    console.log("Usuario encontrado:", usuario);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
};

module.exports = { register, login };

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { json, urlencoded } = require("express");
const protectedRoutes = require("./routes/protected.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const categoriaRoutes = require("./routes/categoria.routes");
const platoRoutes = require("./routes/plato.routes");
const pedidoRoutes = require("./routes/pedido.routes");
const empresaRoutes = require("./routes/empresa.routes");
const bancoRoutes = require("./routes/bancoRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Puerto de tu frontend Vue
    credentials: true, // Permite enviar cookies y headers de autenticación
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/bancos", bancoRoutes);

// Añade esta línea a tus rutas
app.use("/api/platos", platoRoutes);
app.use("/uploads", express.static("uploads")); // para servir imágenes

app.get("/", (req, res) => {
  res.send("API del Restaurante funcionando 🍽️");
});

module.exports = app;

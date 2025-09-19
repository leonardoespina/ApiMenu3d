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

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.108:5173",
  // Agrega otros dominios si es necesario
];

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // ⚠️ Esto es importante
  })
);
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como apps móviles o Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
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

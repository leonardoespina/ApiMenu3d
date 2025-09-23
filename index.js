// index.js
require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

// Aquí se cargan los modelos y se definen las relaciones
// El require de este archivo es suficiente
require("./src/models");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// Sincronizar la base de datos y levantar el servidor
// Sequelize ahora puede determinar el orden correcto de las tablas
require("./src/models");
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("✅ Base de datos sincronizada correctamente.");

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

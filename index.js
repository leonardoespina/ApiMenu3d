require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const { initializeWhatsApp } = require("./src/services/whatsappService");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

// Crear el servidor HTTP
const server = http.createServer(app);

// Crear instancia de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // ajusta si tienes frontend con dominio específico
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Asociar io al objeto app para usarlo desde los controladores
app.set("io", io);

// Eventos básicos de Socket.IO (puedes mover esto a un archivo separado si deseas)
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// Sincronizar la base de datos y levantar el servidor
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("✅ Base de datos sincronizada");
    initializeWhatsApp();
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

const sequelize = require("./config/database");
const Usuario = require("./models/Usuario");

const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a Supabase exitosa.");
    await sequelize.sync({ alter: true }); // o { force: true } si quieres borrar y crear
    console.log("🛠️ Base de datos sincronizada.");
  } catch (error) {
    console.error("❌ Error en la base de datos:", error.message);
  }
};

syncDB();

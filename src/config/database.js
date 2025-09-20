require("dotenv").config();
const { Sequelize } = require("sequelize");
const pg = require("pg");
// Configuración anterior para MySQL
// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false,
//   }
// );

// Nueva configuración para Supabase (PostgreSQL)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  protocol: "postgres",
  logging: false,
});

module.exports = sequelize;

// src/config/baseDatos.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NOMBRE,
  process.env.DB_USUARIO,
  process.env.DB_CLAVE,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PUERTO,
    dialect: 'postgres',
    logging: false,

    // 🔥 Ajuste de zona horaria para Ecuador
    timezone: "-05:00",

    // 🔥 Forzar timestamps a devolverlos como date local (opcional)
    dialectOptions: {
      useUTC: false,            // no usar UTC al leer
      dateStrings: true,        // devolver string en vez de Date
      typeCast: true            // convertir timezone correctamente
    }
  }
);

async function probarConexion() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
  }
}

module.exports = { sequelize, probarConexion };

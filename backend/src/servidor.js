// src/servidor.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { probarConexion } = require('./config/baseDatos');

// Rutas del sistema
const rutasRutas = require('./rutas/rutasRutas');
const rutasSincronizacion = require('./rutas/sincronizacionRutas');
const mobilvendorRoutes = require('./rutas/mobilvendorRoutes');
const login = require('./rutas/loginRoutes');
const crearUsuario = require('./rutas/usuariosRoutes');
const obtenerUsuarios = require('./rutas/usuariosRoutes');

const app = express();
const puerto = process.env.PUERTO || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Mensaje raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Gestor de Rutas funcionando correctamente 🚀' });
});

// Registrar rutas
app.use('/api/login', login);
app.use('/api/usuarios', crearUsuario);
app.use('/api/usuarios', obtenerUsuarios);


// ✔ esta es la sincronización Mobilvendor CORRECTA
app.use('/api/mobilvendor', mobilvendorRoutes);

// ✔ rutas del sistema
app.use('/api/rutas', rutasRutas);
app.use('/api/sincronizacion', rutasSincronizacion);

// Iniciar servidor
app.listen(puerto, async () => {
  await probarConexion();
  console.log(`🚀 Servidor iniciado en http://localhost:${puerto}`);
});

// src/servidor.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { probarConexion } = require('./config/baseDatos');

// Rutas del sistema
const rutasRutas = require('./rutas/rutasRoutes');
const rutasSincronizacion = require('./rutas/sincronizacionRoutes');
const mobilvendorRoutes = require('./rutas/mobilvendorRoutes');
const login = require('./rutas/loginRoutes');
const crearUsuario = require('./rutas/usuariosRoutes');
const obtenerUsuarios = require('./rutas/usuariosRoutes');
const clientesRoutes = require('./rutas/clientesRoutes');


const movilvendorGetRoutes = require('./rutas/movilvendorGetRoutes');


const app = express();
const puerto = process.env.PUERTO || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Mensaje raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Gestor de Rutas funcionando correctamente 🚀' });
});

// Rutas Clientes
app.use('/api/clientes', clientesRoutes);


// Rutas de autenticación / usuarios
app.use('/api/login', login);
app.use('/api/usuarios', crearUsuario);
app.use('/api/usuarios', obtenerUsuarios);

// Rutas específicas MovilVendor (si las usas aparte)
app.use('/api/mobilvendor', mobilvendorRoutes);
app.use('/api/movilvendor/get', movilvendorGetRoutes);


// Rutas de gestión de rutas
app.use('/api/rutas', rutasRutas);

// Rutas de sincronización con MovilVendor
app.use('/api/sincronizacion', rutasSincronizacion);

// Iniciar servidor
app.listen(puerto, async () => {
  await probarConexion();
  console.log(`🚀 Servidor iniciado en http://localhost:${puerto}`);
});

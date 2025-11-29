// src/rutas/sincronizacionRoutes.js
const express = require('express');
const {
  guardarYSincronizar,
  sincronizarDesdeBD
} = require('../controladores/sincronizacionControlador');

const router = express.Router();

// Guarda (si hay payload) + sincroniza
router.post('/guardar-y-sincronizar', guardarYSincronizar);

// Solo sincroniza usando lo que ya está en BD
router.post('/solo-sincronizar', sincronizarDesdeBD);

module.exports = router;

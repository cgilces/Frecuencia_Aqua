const express = require('express');
const {
  guardarYSincronizar
} = require('../controladores/sincronizacionControlador');

const router = express.Router();

router.post('/guardar-y-sincronizar', guardarYSincronizar);

module.exports = router;

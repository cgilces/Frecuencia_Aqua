const express = require('express');
const {
  guardarRutas,
  listarRutas,
  obtenerRutasFiltradas,
  exportarRutasExcel
} = require('../controladores/rutasControlador');

const router = express.Router();

router.post('/guardar', guardarRutas);
router.get('/filtrar', obtenerRutasFiltradas);
router.get('/', listarRutas);
router.get('/exportar-excel', exportarRutasExcel);

module.exports = router;

const express = require('express');
const {
  guardarRutas,
  listarRutas,
  obtenerRutasFiltradas,
  exportarRutasExcel
} = require('../controladores/rutasControlador');

const {
  sincronizarRutasConMovilVendor
} = require('../servicios/rutasServicio');

const router = express.Router();

// =======================
// CRUD / API PRINCIPAL
// =======================
router.post('/guardar', guardarRutas);
router.get('/filtrar', obtenerRutasFiltradas);
router.get('/', listarRutas);
router.get('/exportar-excel', exportarRutasExcel);

// =======================
// 🆕 SINCRONIZAR CON MOVILVENDOR
// =======================
router.post('/sincronizar-movilvendor', async (req, res) => {
  try {
    console.log("📨 Petición recibida: /rutas/sincronizar-movilvendor");

    const resultado = await sincronizarRutasConMovilVendor();

    return res.status(200).json({
      ok: true,
      mensaje: 'Sincronización con MovilVendor realizada correctamente.',
      ...resultado
    });

  } catch (error) {
    console.error("❌ Error en /rutas/sincronizar-movilvendor:", error.message);

    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error al sincronizar con MovilVendor.',
      detalle: error.message
    });
  }
});

module.exports = router;

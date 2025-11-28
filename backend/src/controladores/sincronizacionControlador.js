const { loginMovilVendor, enviarRoutes, enviarRouteDetails } = require('../servicios/movilvendorServicio');
const { guardarRutasDesdePayload, obtenerTodasLasRutas, construirRegistrosRoutes, construirRegistrosRouteDetails } = require('../servicios/rutasServicio');
const { LogSincronizacion } = require('../modelos');
const { generarExcelRutas } = require('../servicios/excelServicio');

async function guardarYSincronizar(req, res) {
  try {
    const { rutas } = req.body;

    if (!Array.isArray(rutas) || rutas.length === 0) {
      return res.status(400).json({ error: 'Debe enviar un arreglo "rutas" con datos.' });
    }

    // Guardar rutas en la base de datos
    const totalGuardadas = await guardarRutasDesdePayload(rutas);

    // Obtener rutas y generar archivo Excel
    const rutasBD = await obtenerTodasLasRutas();
    const rutaArchivoExcel = await generarExcelRutas(rutasBD);

    // Realizar login en MovilVendor
    const sessionId = await loginMovilVendor();

    // Construir registros de rutas y detalles de rutas
    const registrosRoutes = await construirRegistrosRoutes();
    const registrosDetalles = await construirRegistrosRouteDetails();

    // Enviar rutas a MovilVendor
    const respuestaRoutes = await enviarRoutes(sessionId, registrosRoutes);
    
    // Enviar detalles de rutas a MovilVendor
    const respuestaDetalles = await enviarRouteDetails(sessionId, registrosDetalles);

    // Registrar en el log de sincronización
    await LogSincronizacion.create({
      rutasEnviadas: registrosRoutes.length,
      detallesEnviados: registrosDetalles.length,
      estado: 'OK',
      mensaje: `Routes: ${JSON.stringify(respuestaRoutes)}, Details: ${JSON.stringify(respuestaDetalles)}`,
      sessionId
    });

    // Respuesta final
    return res.json({
      mensaje: 'Guardado y sincronización completados correctamente',
      totalGuardadas,
      archivoExcel: rutaArchivoExcel,
      resumenEnvio: {
        rutasEnviadas: registrosRoutes.length,
        detallesEnviados: registrosDetalles.length
      }
    });
  } catch (error) {
    console.error('Error en guardarYSincronizar:', error);

    // Registrar en el log de sincronización si hubo error
    try {
      await LogSincronizacion.create({
        rutasEnviadas: 0,
        detallesEnviados: 0,
        estado: 'ERROR',
        mensaje: error.message,
        sessionId: null
      });
    } catch (e) {
      console.error('Error al registrar en log_sincronizacion:', e);
    }

    return res.status(500).json({
      error: 'Error al guardar y sincronizar',
      detalle: error.message
    });
  }
}

module.exports = {
  guardarYSincronizar
};

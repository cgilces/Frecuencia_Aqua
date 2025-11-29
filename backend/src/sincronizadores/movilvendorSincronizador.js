// src/sincronizadores/movilvendorSincronizador.js
const { LogSincronizacion } = require("../modelos");

const {
  guardarRutasDesdePayload,
  obtenerTodasLasRutas,
  construirRegistrosRoutes,
  construirRegistrosRouteDetails,
  prepararClientesYDirecciones,
} = require("../servicios/rutasServicio");

const {
  loginMovilVendor,
  enviarRoutes,
  enviarRouteDetails,
} = require("../servicios/movilvendorServicio");

const { generarExcelRutas } = require("../servicios/excelServicio");

async function sincronizarMovilVendor({ rutasPayload = null } = {}) {
  console.log("🔄 [SYNC] Iniciando sincronización...");

  let sessionId = null;
  let rutasEnviadas = 0;
  let detallesEnviados = 0;

  try {
    // 1) Guardar rutas si vienen desde frontend
    if (Array.isArray(rutasPayload) && rutasPayload.length > 0) {
      console.log("📥 [SYNC] Guardando rutas desde payload...");
      await guardarRutasDesdePayload(rutasPayload);
    }

    // 2) Obtener rutas
    const rutasBD = await obtenerTodasLasRutas();

    // 3) Generar Excel
    const excelPath = await generarExcelRutas(rutasBD);

    // 4) Preparar registros
    const registrosRoutes = await construirRegistrosRoutes();
    const registrosDetalles = await construirRegistrosRouteDetails();

    // 5) Login
    sessionId = await loginMovilVendor();

    // 6) Validación CRÍTICA
    await prepararClientesYDirecciones(sessionId, registrosDetalles);

    // 7) Enviar routes
    await enviarRoutes(sessionId, registrosRoutes);

    // 8) Enviar route_details
    await enviarRouteDetails(sessionId, registrosDetalles);

    // 9) Log OK
    await LogSincronizacion.create({
      rutasEnviadas: registrosRoutes.length,
      detallesEnviados: registrosDetalles.length,
      estado: "OK",
      mensaje: "Sincronización exitosa",
      sessionId,
    });

    return {
      ok: true,
      mensaje: "Sincronización completada correctamente",
      archivoExcel: excelPath,
      resumenEnvio: {
        rutasEnviadas: registrosRoutes.length,
        detallesEnviados: registrosDetalles.length,
      },
    };
  } catch (error) {
    console.error("❌ [SYNC] ERROR:", error.message);

    await LogSincronizacion.create({
      estado: "ERROR",
      mensaje: error.message,
      rutasEnviadas,
      detallesEnviados,
      sessionId,
    });

    throw error;
  }
}

module.exports = { sincronizarMovilVendor };

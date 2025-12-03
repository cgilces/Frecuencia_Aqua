// src/sincronizadores/movilvendorSincronizador.js

const {
  obtenerCliente,
  crearCliente,
  obtenerDirecciones,
  crearDireccionPrincipal,
  loginMovilVendor,
  enviarRoutes,
  enviarRouteDetails
} = require("../servicios/movilvendorServicio");

const {
  guardarRutasDesdePayload,
  obtenerTodasLasRutas,
  construirRegistrosRoutes,
  construirRegistrosRouteDetails
} = require("../servicios/rutasServicio");

const { generarExcelRutas } = require("../servicios/excelServicio");
const { LogSincronizacion } = require("../modelos");

// ======================================================
// 🔄 SINCRONIZAR COMPLETA
// ======================================================
async function sincronizarMovilVendor({ rutasPayload = null } = {}) {
  console.log("🔄 [SYNC] Iniciando sincronización...");

  let sessionId = null;

  try {
    // 1) Guardar rutas si vienen en payload
    if (rutasPayload) {
      console.log("📥 [SYNC] Guardando rutas del payload...");
      await guardarRutasDesdePayload(rutasPayload);
    }

    // 2) Rutas desde BD
    const rutasBD = await obtenerTodasLasRutas();
    const excelPath = await generarExcelRutas(rutasBD);

    // 3) Preparar registros MovilVendor
    const registrosRoutes = await construirRegistrosRoutes();
    const registrosDetalles = await construirRegistrosRouteDetails();

    // 4) Login
    sessionId = await loginMovilVendor();

    // ============================================================
    // 🔥 5) VALIDAR CLIENTES ÚNICOS (YA NO REPETIDO 136 VECES)
    // ============================================================
    console.log("👥 [SYNC] Validando clientes únicos...");

    const clientesUnicos = [...new Set(registrosDetalles.map(d => d.customer_code))];

    console.log(`📌 [SYNC] Total clientes únicos: ${clientesUnicos.length}`);

    for (const code of clientesUnicos) {
      console.log(`\n👤 [MV] Validando cliente ${code}...`);

      // ¿Existe cliente?
      const cliente = await obtenerCliente(sessionId, code);

      if (!cliente) {
        console.log(`➕ [SYNC] Cliente ${code} NO existe. Creando...`);
        const ok = await crearCliente(sessionId, code, "SIN NOMBRE");

        if (!ok) throw new Error(`Error creando cliente ${code}`);
      }

      // Validar direcciones
      const dirs = await obtenerDirecciones(sessionId, code);

      const tienePrincipal = dirs?.some(d => d.code === "PRINCIPAL");

      if (!tienePrincipal) {
        console.log(`➕ [SYNC] Cliente ${code} sin dirección PRINCIPAL. Creando...`);
        const ok = await crearDireccionPrincipal(sessionId, code);

        if (!ok) throw new Error(`Error creando dirección PRINCIPAL para cliente ${code}`);
      }

      console.log(`✔ [SYNC] Cliente ${code} validado.`);
    }

    // 6) Enviar schema routes
    await enviarRoutes(sessionId, registrosRoutes);

    // 7) Enviar schema route_details
    await enviarRouteDetails(sessionId, registrosDetalles);

    // 8) Log de éxito
    await LogSincronizacion.create({
      rutasEnviadas: registrosRoutes.length,
      detallesEnviados: registrosDetalles.length,
      estado: "OK",
      mensaje: "Sincronización exitosa",
      sessionId
    });

    return {
      ok: true,
      mensaje: "Sincronización completa",
      archivoExcel: excelPath
    };

  } catch (err) {
    console.error("❌ [SYNC] ERROR:", err.message);

    await LogSincronizacion.create({
      estado: "ERROR",
      mensaje: err.message,
      sessionId
    });

    throw err;
  }
}

module.exports = { sincronizarMovilVendor };

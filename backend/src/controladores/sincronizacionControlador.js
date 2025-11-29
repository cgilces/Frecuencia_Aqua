// src/controladores/sincronizacionControlador.js
const { sincronizarMovilVendor } = require('../sincronizadores/movilvendorSincronizador');

// ===============================================
//  📌 GUARDAR Y SINCRONIZAR (payload opcional)
// ===============================================
exports.guardarYSincronizar = async (req, res) => {
  console.log("📨 [CTRL SYNC] POST /guardar-y-sincronizar");

  try {
    const rutasPayload = Array.isArray(req.body.rutas)
      ? req.body.rutas
      : null;

    if (rutasPayload) {
      console.log(`📝 [CTRL SYNC] Payload recibido: ${rutasPayload.length} rutas`);
    } else {
      console.log("ℹ️ [CTRL SYNC] No se recibió payload. Se usará BD.");
    }

    const resultado = await sincronizarMovilVendor({ rutasPayload });

    return res.json(resultado);

  } catch (err) {
    console.error("❌ [CTRL SYNC] Error:", err.message);
    return res.status(500).json({
      ok: false,
      error: "Error al guardar y sincronizar",
      detalle: err.message
    });
  }
};

// ===============================================
//  📌 SINCRONIZAR SOLO DESDE BASE DE DATOS
// ===============================================
exports.sincronizarDesdeBD = async (req, res) => {
  console.log("📨 [CTRL SYNC] GET /solo-sincronizar");

  try {
    const resultado = await sincronizarMovilVendor({ rutasPayload: null });

    return res.json(resultado);

  } catch (err) {
    console.error("❌ [CTRL SYNC] Error:", err.message);
    return res.status(500).json({
      ok: false,
      error: "Error al sincronizar desde BD",
      detalle: err.message
    });
  }
};

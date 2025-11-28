// src/rutas/mobilvendorRoutes.js
const express = require("express");
const router = express.Router();

const { Cliente } = require("../modelos"); // YA FUNCIONA

const MOBILVENDOR_URL = "https://s31.mobilvendor.com/web-service";

const MOBILVENDOR_LOGIN_BODY = {
  action: "login",
  login: "7",
  password: "Aqua2026.",
  context: "grupoaqua",
};

// ====================================================
// LOGIN EN MOBILVENDOR
// ====================================================
async function mobilvendorLogin() {
  const res = await fetch(MOBILVENDOR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(MOBILVENDOR_LOGIN_BODY),
  });

  if (!res.ok) {
    throw new Error(`Error HTTP en login Mobilvendor: ${res.status}`);
  }

  const data = await res.json();

  if (!data.session_id) {
    throw new Error("Mobilvendor no devolvió session_id");
  }

  return data.session_id;
}

// ====================================================
// DESCARGAR TODO UN SCHEMA (clientes / direcciones)
// ====================================================
async function fetchAllFromMobilvendor(sessionId, schema) {
  const BATCH_SIZE = 1000;
  let page = 1;
  let hasMore = true;
  const records = [];

  while (hasMore) {
    const body = {
      session_id: sessionId,
      action: "get",
      schema,
      page,
      limit: BATCH_SIZE,
    };

    const res = await fetch(MOBILVENDOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Error HTTP obteniendo ${schema}: ${res.status}`);
    }

    const data = await res.json();

    if (data.records && data.records.length > 0) {
      records.push(...data.records);
    }

    const totalPages = data.pages || 1;

    if (page >= totalPages) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return records;
}

// ====================================================
// RUTA PARA SINCRONIZAR CLIENTES
// ====================================================
router.post("/sync-clientes", async (req, res) => {
  try {
    console.log("🔵 Iniciando login en Mobilvendor...");
    const sessionId = await mobilvendorLogin();
    console.log("🟢 Session ID:", sessionId);

    console.log("🔵 Descargando clientes...");
    const customers = await fetchAllFromMobilvendor(sessionId, "customers");
    console.log(`🟢 Clientes obtenidos: ${customers.length}`);

    const now = new Date();

    const clientesToUpsert = customers.map((c) => ({
      codigo: String(c.code),
      identificacion: c.identity_ ? String(c.identity_) : null,
      nombre: c.name ? String(c.name) : null,
      nombre_empresa: c.company_name ? String(c.company_name) : null,
      contacto: c.contact ? String(c.contact) : null,
      categoria_precio: c.price_list_code_lookup ? String(c.price_list_code_lookup) : null,
      vendedor_asignado: c.user_code_lookup ? String(c.user_code_lookup) : null,
      estado: c.status != null ? String(c.status) : null,
      correo: c.email ? String(c.email) : null,
      saldo: c.balance || 0,
      fecha_ultima_sincronizacion: now,
    }));

    // Evitar duplicados por "codigo"
    const uniqueClientes = Array.from(
      new Map(clientesToUpsert.map((cli) => [cli.codigo, cli])).values()
    );

    console.log("🔵 Registrando en PostgreSQL:", uniqueClientes.length);

    await Cliente.bulkCreate(uniqueClientes, {
      updateOnDuplicate: [
        "identificacion",
        "nombre",
        "nombre_empresa",
        "contacto",
        "categoria_precio",
        "vendedor_asignado",
        "estado",
        "correo",
        "saldo",
        "fecha_ultima_sincronizacion",
      ],
    });

    console.log("🟢 Sincronización completada.");

    return res.json({
      ok: true,
      mensaje: "Sincronización completada con éxito.",
      totalClientes: uniqueClientes.length,
    });
  } catch (error) {
    console.error("❌ Error en /api/mobilvendor/sync-clientes:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Error interno.",
    });
  }
});

module.exports = router;

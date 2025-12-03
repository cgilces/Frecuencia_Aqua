// src/servicios/movilvendorServicio.js
const axios = require("axios");
require("dotenv").config();

const urlMovilVendor = process.env.MV_URL;

// ==============================================
// 🔐 LOGIN EN MOVILVENDOR
// ==============================================
async function loginMovilVendor() {
  console.log("🔐 [MV] Iniciando login...");

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "login",
      login: process.env.MV_USUARIO,
      password: process.env.MV_CLAVE,
      context: process.env.MV_CONTEXT || "grupoaqua"
    });

    if (!resp.data?.session_id) {
      throw new Error("No se recibió session_id en login");
    }

    const sid = resp.data.session_id;
    console.log(`✔ [MV] Login exitoso → session_id: ${sid}`);
    return sid;

  } catch (e) {
    console.error("❌ [MV] Error en login:", e.response?.data || e.message);
    throw new Error("Error en login MovilVendor: " + e.message);
  }
}

// ==============================================
// 🔍 CONSULTAR CLIENTE
// ==============================================
async function obtenerCliente(sessionId, customerCode) {
  console.log(`🔎 [MV] Consultando cliente ${customerCode}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "get",
      schema: "customers",
      session_id: sessionId,
      code: customerCode
    });

    if (resp.data.total > 0) {
      console.log(`✔ [MV] Cliente ${customerCode} EXISTE`);
      return resp.data;
    }

    console.log(`⚠ [MV] Cliente ${customerCode} NO existe`);
    return null;

  } catch (e) {
    console.error("❌ [MV] Error consultando cliente:", e.response?.data || e.message);
    return null;
  }
}

// ==============================================
// ➕ CREAR CLIENTE
// ==============================================
async function crearCliente(sessionId, customerCode, description = "") {
  console.log(`➕ [MV] Creando cliente ${customerCode}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "put",
      schema: "customers",
      session_id: sessionId,
      records: [
        {
          code: customerCode,
          description: description || "SIN NOMBRE",
          category_code: "A",
          address: "SIN DIRECCIÓN"
        }
      ]
    });

    if (resp.data.errors > 0) {
      console.error("❌ [MV] Error creando cliente:", resp.data);
      return false;
    }

    console.log(`✔ [MV] Cliente ${customerCode} creado correctamente`);
    return true;

  } catch (e) {
    console.error("❌ [MV] Error creando cliente:", e.response?.data || e.message);
    return false;
  }
}

// ==============================================
// 🔍 CONSULTAR DIRECCIONES DEL CLIENTE
// ==============================================
async function obtenerDirecciones(sessionId, customerCode) {
  console.log(`🔎 [MV] Consultando direcciones del cliente ${customerCode}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "get",
      schema: "customer_addresses",
      session_id: sessionId,
      customer_code: customerCode
    });

    if (resp.data.total === 0) {
      console.log(`⚠ [MV] Cliente ${customerCode} NO tiene direcciones`);
      return [];
    }

    console.log(`✔ [MV] Cliente ${customerCode} tiene ${resp.data.total} direcciones`);
    return resp.data.data;

  } catch (e) {
    console.error("❌ [MV] Error consultando direcciones:", e.response?.data || e.message);
    return [];
  }
}

// ==============================================
// ➕ CREAR DIRECCIÓN PRINCIPAL
// ==============================================
async function crearDireccionPrincipal(sessionId, customerCode) {
  console.log(`➕ [MV] Creando dirección PRINCIPAL para cliente ${customerCode}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "put",
      schema: "customer_addresses",
      session_id: sessionId,
      records: [
        {
          code: "PRINCIPAL",
          customer_code: customerCode,
          address: "SIN DIRECCIÓN",
          city: "N/A"
        }
      ]
    });

    if (resp.data.errors > 0) {
      console.error("❌ [MV] Error creando dirección:", resp.data);
      return false;
    }

    console.log(`✔ [MV] Dirección PRINCIPAL creada para ${customerCode}`);
    return true;

  } catch (e) {
    console.error("❌ [MV] Error creando dirección:", e.response?.data || e.message);
    return false;
  }
}

// ==============================================
// 📤 ENVIAR ROUTES
// ==============================================
async function enviarRoutes(sessionId, registros) {
  console.log(`📤 [MV] Enviando ${registros.length} rutas a MovilVendor...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "put",
      schema: "routes",
      session_id: sessionId,
      records: registros
    });

    if (resp.data.errors > 0) {
      throw new Error(JSON.stringify(resp.data));
    }

    console.log("✔ [MV] Routes enviados correctamente");
    return resp.data;

  } catch (e) {
    console.error("❌ [MV] Error enviando routes:", e.response?.data || e.message);
    throw new Error("Error enviando routes: " + e.message);
  }
}

// ==============================================
// 📤 ENVIAR ROUTE DETAILS
// ==============================================
async function enviarRouteDetails(sessionId, registros) {
  console.log(`📤 [MV] Enviando ${registros.length} route_details...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "put",
      schema: "route_details",
      session_id: sessionId,
      records: registros
    });

    if (resp.data.errors > 0) {
      console.error("❌ [MV] Error en route_details:", resp.data);
      throw new Error(JSON.stringify(resp.data));
    }

    console.log("✔ [MV] route_details enviados correctamente");
    return resp.data;

  } catch (e) {
    console.error("❌ [MV] Error enviando route_details:", e.response?.data || e.message);
    throw new Error("Error enviando route_details: " + e.message);
  }
}

// ===============================================
// 📥 OBTENER CABECERAS DE RUTAS (GET routes)
// ===============================================
async function getRoutes(sessionId, page = 1) {
  console.log(`📥 [MV] get routes page=${page}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: "get",
      schema: "routes",
      page
    });

    console.log(`✔ [MV] Routes recibidos (page ${page}): ${resp.data.records?.length || 0}`);

    return resp.data;

  } catch (e) {
    console.error("❌ [MV] Error get routes:", e.response?.data || e.message);
    throw new Error("Error obteniendo routes: " + e.message);
  }
}

// ===============================================
// 📥 OBTENER CABECERAS DE RUTAS (GET routes)
// ===============================================
async function getRoutes(sessionId, page = 1) {
  console.log(`📥 [MV] get routes page=${page}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: "get",
      schema: "routes",
      page
    });

    console.log(`✔ [MV] Routes recibidos (page ${page}): ${resp.data.records?.length || 0}`);

    return resp.data;

  } catch (e) {
    console.error("❌ [MV] Error get routes:", e.response?.data || e.message);
    throw new Error("Error obteniendo routes: " + e.message);
  }
}
// ===============================================
// 📥 OBTENER DETALLES DE RUTAS (GET route_details)
// ===============================================
async function getRouteDetails(sessionId, page = 1) {
  console.log(`📥 [MV] get route_details page=${page}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: "get",
      schema: "route_details",
      page
    });

    console.log(`✔ [MV] Route_details recibidos (page ${page}): ${resp.data.records?.length || 0}`);

    return resp.data;

  } catch (e) {
    console.error("❌ [MV] Error get route_details:", e.response?.data || e.message);
    throw new Error("Error obteniendo route_details: " + e.message);
  }
}
// ==================================================
// 📥 OBTENER USUARIOS ASIGNADOS A RUTAS
// ==================================================
async function getUsersInRoutes(sessionId, page = 1) {
  console.log(`📥 [MV] get users_in_routes page=${page}...`);

  try {
    const resp = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: "get",
      schema: "users_in_routes",
      page
    });

    console.log(`✔ [MV] users_in_routes recibidos (page ${page}): ${resp.data.records?.length || 0}`);

    return resp.data;

  } catch (e) {
    console.error("❌ [MV] Error get users_in_routes:", e.response?.data || e.message);
    throw new Error("Error obteniendo users_in_routes: " + e.message);
  }
}



module.exports = {
  loginMovilVendor,
  obtenerCliente,
  crearCliente,
  obtenerDirecciones,
  crearDireccionPrincipal,
  enviarRoutes,
  enviarRouteDetails,
  getRoutes,
  getRouteDetails,
  getUsersInRoutes
};

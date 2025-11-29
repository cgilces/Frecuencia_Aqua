// src/servicios/movilvendorServicio.js
const axios = require("axios");
require("dotenv").config();

const urlMovilVendor = process.env.MV_URL;

// ========================================================
// LOGIN
// ========================================================
async function loginMovilVendor() {
  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "login",
      login: process.env.MV_USUARIO,
      password: process.env.MV_CLAVE,
      context: process.env.MV_CONTEXT || "grupoaqua",
    });

    if (!resp.data?.session_id) {
      throw new Error("No se pudo obtener session_id de MovilVendor");
    }

    console.log(`🔐 [MV] Login exitoso. session_id=${resp.data.session_id}`);
    return resp.data.session_id;
  } catch (e) {
    console.error("❌ [MV] Error en login:", e.message);
    throw e;
  }
}

// ========================================================
// CONSULTAR CLIENTE
// ========================================================
async function obtenerCliente(sessionId, customerCode) {
  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "get",
      schema: "customers",
      session_id: sessionId,
      code: customerCode,
    });

    return resp.data;
  } catch (e) {
    console.error("❌ [MV] Error consultando cliente:", e.message);
    return null;
  }
}

// ========================================================
// CREAR CLIENTE
// ========================================================
async function crearCliente(sessionId, customerCode, description) {
  try {
    console.log(`⚠ [MV] Cliente ${customerCode} no existe. Creando...`);

    const resp = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: "put",
      schema: "customers",
      records: [
        {
          code: customerCode,
          description: description || "SIN NOMBRE",
          category_code: "A",
          address: "SIN DIRECCIÓN",
        },
      ],
    });

    if (resp.data.errors > 0) {
      console.error("❌ [MV] Error creando cliente:", resp.data);
      return false;
    }

    console.log(`✔ [MV] Cliente ${customerCode} creado`);
    return true;
  } catch (e) {
    console.error("❌ [MV] Error al crear cliente:", e.message);
    return false;
  }
}

// ========================================================
// CONSULTAR DIRECCIONES
// ========================================================
async function obtenerDirecciones(sessionId, customerCode) {
  try {
    const resp = await axios.post(urlMovilVendor, {
      action: "get",
      schema: "customer_addresses",
      session_id: sessionId,
      customer_code: customerCode,
    });

    return resp.data;
  } catch (e) {
    console.error("❌ [MV] Error obteniendo direcciones:", e.message);
    return null;
  }
}

// ========================================================
// CREAR DIRECCIÓN PRINCIPAL
// ========================================================
async function crearDireccionPrincipal(sessionId, customerCode) {
  try {
    console.log(
      `⚠ [MV] Cliente ${customerCode} no tiene dirección PRINCIPAL. Creando...`
    );

    const resp = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: "put",
      schema: "customer_addresses",
      records: [
        {
          code: "PRINCIPAL",
          customer_code: customerCode,
          address: "SIN DIRECCIÓN",
          city: "N/A",
        },
      ],
    });

    if (resp.data.errors > 0) {
      console.error("❌ [MV] Error creando dirección:", resp.data);
      return false;
    }

    console.log(`✔ [MV] Dirección PRINCIPAL creada → ${customerCode}`);
    return true;
  } catch (e) {
    console.error("❌ [MV] Error al crear dirección:", e.message);
    return false;
  }
}

// ========================================================
// ENVIAR ROUTES
// ========================================================
async function enviarRoutes(sessionId, registros) {
  console.log(`📤 [MV] Enviando ${registros.length} registros a schema 'routes'...`);

  const resp = await axios.post(urlMovilVendor, {
    session_id: sessionId,
    action: "put",
    schema: "routes",
    records: registros,
  });

  if (resp.data.errors > 0) {
    throw new Error(JSON.stringify(resp.data));
  }

  console.log("✔ [MV] Routes enviados correctamente");
  return resp.data;
}

// ========================================================
// ENVIAR ROUTE DETAILS
// ========================================================
async function enviarRouteDetails(sessionId, registros) {
  console.log(
    `📤 [MV] Enviando ${registros.length} registros a schema 'route_details'...`
  );

  const resp = await axios.post(urlMovilVendor, {
    session_id: sessionId,
    action: "put",
    schema: "route_details",
    records: registros,
  });

  if (resp.data.errors > 0) {
    console.error("❌ [MV] Respuesta con errores en route_details:", resp.data);
    throw new Error(JSON.stringify(resp.data));
  }

  console.log("✔ [MV] Route_details enviados correctamente");
  return resp.data;
}

module.exports = {
  loginMovilVendor,
  obtenerCliente,
  crearCliente,
  obtenerDirecciones,
  crearDireccionPrincipal,
  enviarRoutes,
  enviarRouteDetails,
};

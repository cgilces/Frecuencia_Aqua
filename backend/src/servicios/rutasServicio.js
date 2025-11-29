// src/servicios/rutasServicio.js
const {
  obtenerCliente,
  crearCliente,
  obtenerDirecciones,
  crearDireccionPrincipal,
} = require("./movilvendorServicio");
const { Ruta } = require("../modelos");

// ========================================================
// VALIDAR RUTA LOCAL
// ========================================================
function validarRuta(dato) {
  const errores = [];
  const ruc = dato["RUC"];
  const nombre = dato["Nombre a Mostrar"];
  const ruta = dato["Ruta"];

  if (!ruc || !/^\d{9,13}$/.test(ruc)) {
    errores.push(`RUC inválido: "${ruc}"`);
  }
  if (!nombre) errores.push("El campo 'Nombre a Mostrar' está vacío.");
  if (!ruta) errores.push("El campo 'Ruta' está vacío.");

  if (errores.length > 0) throw new Error(errores.join(" | "));
}

// ========================================================
// GUARDAR RUTAS EN BD
// ========================================================
async function guardarRutasDesdePayload(lista) {
  console.log("🚀 [RUTAS] Guardando rutas...");

  let total = 0;

  for (const dato of lista) {
    try {
      validarRuta(dato);

      await Ruta.upsert({
        ruc: dato["RUC"],
        nombreMostrar: dato["Nombre a Mostrar"],
        telefono: dato["Teléfono"],
        categoria: dato["Categoria"],
        latitudGeografica: dato["Latitud geográfica"],
        longitudGeografica: dato["Longitud geográfica"],
        zona: dato["ZONA"],
        ruta: dato["Ruta"],
        l: !!dato["L"],
        m: !!dato["M"],
        x: !!dato["X"],
        j: !!dato["J"],
        v: !!dato["V"],
        s: !!dato["S"],
        inactivo: !!dato["INACTIVO"],
        novedad: dato["Novedad"] || null,
      });

      total++;
    } catch (e) {
      console.error(`❌ [RUTAS] Error con RUC ${dato["RUC"]}:`, e.message);
    }
  }

  console.log(`✔ [RUTAS] ${total} registros guardados.`);
  return total;
}

// ========================================================
// OBTENER TODAS LAS RUTAS
// ========================================================
async function obtenerTodasLasRutas() {
  return Ruta.findAll({
    order: [
      ["ruta", "ASC"],
      ["nombreMostrar", "ASC"],
    ],
  });
}

// ========================================================
// ROUTES PARA MOVILVENDOR
// ========================================================
async function construirRegistrosRoutes() {
  const rutas = await Ruta.findAll({
    attributes: ["ruta"],
    group: ["ruta"],
  });

  return rutas.map((r) => ({
    code: r.ruta,
    description: r.ruta,
  }));
}

// ========================================================
// ROUTE_DETAILS PARA MOVILVENDOR
// ========================================================
async function construirRegistrosRouteDetails() {
  const rutas = await Ruta.findAll();
  const registros = [];
  let sec = 1;

  const dias = [
    { campo: "l", diaNumero: 2 },
    { campo: "m", diaNumero: 3 },
    { campo: "x", diaNumero: 4 },
    { campo: "j", diaNumero: 5 },
    { campo: "v", diaNumero: 6 },
    { campo: "s", diaNumero: 7 },
  ];

  for (const r of rutas) {
    dias.forEach((d) => {
      if (r[d.campo]) {
        registros.push({
          code: `${r.ruta}-${r.ruc}-${d.diaNumero}-${sec}`,
          route_code: r.ruta,
          customer_code: r.ruc,
          description: r.nombreMostrar,
          customer_address_code: "PRINCIPAL",
          week: 1,
          sequence: sec,
          day: d.diaNumero,
        });
        sec++;
      }
    });
  }

  return registros;
}

// ========================================================
// VALIDAR CLIENTES Y DIRECCIONES EN MOVILVENDOR
// ========================================================
async function prepararClientesYDirecciones(sessionId, registrosDetalles) {
  console.log("🔍 [MV] Validando clientes y direcciones...");

  for (const det of registrosDetalles) {
    const customerCode = det.customer_code;

    console.log(`\n👤 [MV] Cliente: ${customerCode}`);

    // 1) Validar cliente
    const cliente = await obtenerCliente(sessionId, customerCode);

    if (!cliente || cliente.total === 0) {
      console.log(`⚠ [MV] Cliente ${customerCode} no existe. Se creará.`);
      await crearCliente(sessionId, customerCode, det.description);
    } else {
      console.log(`✔ [MV] Cliente ${customerCode} OK`);
    }

    // 2) Validar direcciones
    const direcciones = await obtenerDirecciones(sessionId, customerCode);

    if (!direcciones || direcciones.total === 0) {
      console.log(`⚠ [MV] Cliente ${customerCode} no tiene direcciones. Creando PRINCIPAL...`);
      await crearDireccionPrincipal(sessionId, customerCode);
    }

    det.customer_address_code = "PRINCIPAL"; // 🔥 obligatorio
    det.week = 1;
  }

  console.log("\n✔ [MV] Validación completada.");
}

module.exports = {
  validarRuta,
  guardarRutasDesdePayload,
  obtenerTodasLasRutas,
  construirRegistrosRoutes,
  construirRegistrosRouteDetails,
  prepararClientesYDirecciones,
};

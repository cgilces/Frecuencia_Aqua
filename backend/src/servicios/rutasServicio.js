// src/servicios/rutasServicio.js
const { Ruta } = require("../modelos");

// ===================================================
// 🔍 Validar ruta
// ===================================================
function validarRuta(dato) {
  const errores = [];

  if (!dato["RUC"] || !/^\d{9,13}$/.test(dato["RUC"])) {
    errores.push("RUC inválido");
  }

  if (!dato["Nombre a Mostrar"]) {
    errores.push("Nombre vacío");
  }

  if (!dato["Ruta"]) {
    errores.push("Ruta vacía");
  }

  if (errores.length > 0) {
    throw new Error(errores.join(" | "));
  }
}

// ===================================================
// 💾 Guardar rutas
// ===================================================
async function guardarRutasDesdePayload(lista) {
  console.log("💾 [RUTAS] Guardando rutas recibidas...");

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
        novedad: dato["Novedad"] || null
      });

      total++;
    } catch (err) {
      console.error("❌ [RUTAS] Error guardando:", err.message);
    }
  }

  console.log(`✔ [RUTAS] Total guardadas: ${total}`);
  return total;
}

// ===================================================
// 📥 Obtener todas
// ===================================================
async function obtenerTodasLasRutas() {
  return Ruta.findAll({
    order: [["ruta", "ASC"], ["nombreMostrar", "ASC"]]
  });
}

// ===================================================
// 🧱 Construir routes
// ===================================================
async function construirRegistrosRoutes() {
  const rutas = await Ruta.findAll({
    attributes: ["ruta"],
    group: ["ruta"]
  });

  return rutas.map(r => ({
    code: r.ruta,
    description: r.ruta
  }));
}

// ===================================================
// 🧱 Construir route_details
// ===================================================
async function construirRegistrosRouteDetails() {
  const rutas = await Ruta.findAll();
  const registros = [];

  let i = 1;

  for (const r of rutas) {
    const dias = [
      { flag: r.l, d: 2 },
      { flag: r.m, d: 3 },
      { flag: r.x, d: 4 },
      { flag: r.j, d: 5 },
      { flag: r.v, d: 6 },
      { flag: r.s, d: 7 }
    ];

    for (const d of dias) {
      if (d.flag) {
        registros.push({
          code: `${r.ruta}-${r.ruc}-${d.d}-${i}`,
          route_code: r.ruta,
          customer_code: r.ruc,
          description: r.nombreMostrar,
          customer_address_code: "PRINCIPAL",
          week: 1,
          sequence: i,
          day: d.d
        });

        i++;
      }
    }
  }

  return registros;
}

module.exports = {
  validarRuta,
  guardarRutasDesdePayload,
  obtenerTodasLasRutas,
  construirRegistrosRoutes,
  construirRegistrosRouteDetails
};

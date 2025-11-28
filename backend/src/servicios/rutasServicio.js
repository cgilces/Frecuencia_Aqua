const { Ruta } = require('../modelos');

// Valida los datos antes de guardarlos
function validarRuta(dato) {
  console.log("🔍 VALIDANDO REGISTRO:", JSON.stringify(dato, null, 2));

  const errores = [];

  const ruc = dato['RUC'];
  const nombre = dato['Nombre a Mostrar'];
  const ruta = dato['Ruta'];

  console.log("➡ RUC recibido:", ruc);
  console.log("➡ Nombre recibido:", nombre);
  console.log("➡ Ruta recibida:", ruta);

  // =============================
  // VALIDACIÓN RUC
  // =============================
  if (!ruc) {
    console.warn("⚠ ERROR: RUC VACÍO");
    errores.push("El campo RUC está vacío.");
  } else if (!/^\d{9,13}$/.test(ruc)) {
    console.warn("⚠ ERROR: RUC FORMATO INVÁLIDO →", ruc);
    errores.push(`El RUC "${ruc}" no tiene un formato válido.`);
  } else {
    console.log("✔ RUC válido");
  }

  // =============================
  // VALIDACIÓN NOMBRE
  // =============================
  if (!nombre || nombre.toString().trim() === "") {
    console.warn("⚠ ERROR: NOMBRE VACÍO");
    errores.push("El campo 'Nombre a Mostrar' está vacío.");
  } else {
    console.log("✔ Nombre válido");
  }

  // =============================
  // VALIDACIÓN RUTA
  // =============================
  if (!ruta || ruta.toString().trim() === "") {
    console.warn("⚠ ERROR: RUTA VACÍA");
    errores.push("El campo 'Ruta' está vacío.");
  } else {
    console.log("✔ Ruta válida");
  }

  // =============================
  // VALIDACIÓN COORDENADAS
  // =============================
  if (dato['Latitud geográfica'] && isNaN(dato['Latitud geográfica'])) {
    console.warn("⚠ ERROR: LATITUD INVÁLIDA →", dato['Latitud geográfica']);
    errores.push("La latitud no es un número válido.");
  }

  if (dato['Longitud geográfica'] && isNaN(dato['Longitud geográfica'])) {
    console.warn("⚠ ERROR: LONGITUD INVÁLIDA →", dato['Longitud geográfica']);
    errores.push("La longitud no es un número válido.");
  }

  // =============================
  // MOSTRAR ERRORES SI HAY
  // =============================
  if (errores.length > 0) {
    console.error("❌ ERRORES EN REGISTRO:", errores.join(" | "));
    throw new Error(errores.join(" | "));
  }

  console.log("✅ REGISTRO VÁLIDO →", ruc);
  return true;
}


// Guardar o actualizar rutas en la base de datos
async function guardarRutasDesdePayload(listaRutas) {
  console.log("🚀 Iniciando guardado de rutas...");
  console.log("📦 Total de registros recibidos:", listaRutas.length);

  let total = 0;

  for (const dato of listaRutas) {
    console.log("────────────────────────────────────────");
    console.log("📍 PROCESANDO REGISTRO:");
    console.log(JSON.stringify(dato, null, 2));

    try {
      console.log("🔍 Validando datos...");
      validarRuta(dato);

      const registro = {
        ruc: dato['RUC'],
        nombreMostrar: dato['Nombre a Mostrar'],
        telefono: dato['Teléfono'],
        categoria: dato['Categoria'],
        latitudGeografica: dato['Latitud geográfica'],
        longitudGeografica: dato['Longitud geográfica'],
        zona: dato['ZONA'],
        ruta: dato['Ruta'],
        l: !!dato['L'],
        m: !!dato['M'],
        x: !!dato['X'],
        j: !!dato['J'],
        v: !!dato['V'],
        s: !!dato['S'],
        inactivo: !!dato['INACTIVO'],
        novedad: dato['Novedad'] || null
      };

      console.log("📤 Enviando a BD (upsert):");
      console.log(JSON.stringify(registro, null, 2));

      await Ruta.upsert(registro);

      total++;
      console.log(`✅ GUARDADO OK → RUC: ${dato['RUC']}`);

    } catch (error) {
      console.error("❌ ERROR AL GUARDAR REGISTRO");
      console.error("RUC:", dato['RUC']);
      console.error("Mensaje:", error.message);
    }
  }

  console.log("========================================");
  console.log(`🏁 PROCESO TERMINADO → ${total} registros guardados correctamente.`);
  console.log("========================================");

  return total;
}


// Obtener todas las rutas desde la base de datos
async function obtenerTodasLasRutas() {
  try {
    return await Ruta.findAll({
      order: [['ruta', 'ASC'], ['nombreMostrar', 'ASC']]
    });
  } catch (error) {
    console.error('Error al obtener todas las rutas:', error.message);
    throw new Error('Error al obtener las rutas');
  }
}

// Construir los registros para schema: routes
async function construirRegistrosRoutes() {
  try {
    const rutas = await Ruta.findAll({
      attributes: ['ruta'],
      group: ['ruta']
    });

    return rutas
      .filter(r => r.ruta)
      .map(r => ({
        code: r.ruta,
        description: r.ruta
      }));
  } catch (error) {
    console.error('Error al construir registros para routes:', error.message);
    throw new Error('Error al construir registros para routes');
  }
}

// Construir los registros para schema: route_details
async function construirRegistrosRouteDetails() {
  try {
    const rutas = await Ruta.findAll();
    const registros = [];
    let contador = 1;

    for (const r of rutas) {
      const dias = [
        { campo: 'l', diaNumero: 2 },
        { campo: 'm', diaNumero: 3 },
        { campo: 'x', diaNumero: 4 },
        { campo: 'j', diaNumero: 5 },
        { campo: 'v', diaNumero: 6 },
        { campo: 's', diaNumero: 7 }
      ];

      dias.forEach(d => {
        if (r[d.campo]) {
          registros.push({
            code: `${r.ruta}-${r.ruc}-${d.diaNumero}-${contador}`,
            route_code: r.ruta,
            customer_code: r.ruc,
            description: r.nombreMostrar || '',
            customer_address_code: 'PRINCIPAL',
            week: 0,
            sequence: contador,
            day: d.diaNumero
          });
          contador++;
        }
      });
    }

    return registros;
  } catch (error) {
    console.error('Error al construir registros para route_details:', error.message);
    throw new Error('Error al construir registros para route_details');
  }
}

module.exports = {
  guardarRutasDesdePayload,
  obtenerTodasLasRutas,
  construirRegistrosRoutes,
  construirRegistrosRouteDetails
};

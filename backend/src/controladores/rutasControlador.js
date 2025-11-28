const {
  guardarRutasDesdePayload,
  obtenerTodasLasRutas
} = require('../servicios/rutasServicio');
const { generarExcelRutas } = require('../servicios/excelServicio');

async function guardarRutas(req, res) {
  try {
    const { rutas } = req.body;

    if (!Array.isArray(rutas) || rutas.length === 0) {
      return res.status(400).json({ error: 'Debe enviar un arreglo "rutas" con datos.' });
    }

    const total = await guardarRutasDesdePayload(rutas);

     return res.json({
      mensaje: 'Rutas guardadas/actualizadas correctamente',
      total
    });
  } catch (error) {
    console.error('Error al guardar rutas:', error);
    return res.status(500).json({ error: 'Error al guardar rutas' });
  }
}

const { Ruta } = require('../modelos');

// Obtener rutas filtradas según el rol del usuario
async function obtenerRutasFiltradas(req, res) {
  try {
    const { rol, ruta } = req.query;

    // Si es admin → devuelve todo
    if (rol === "ADMIN") {
      const todas = await Ruta.findAll({
        order: [['ruta', 'ASC'], ['nombreMostrar', 'ASC']]
      });
      return res.json(todas);
    }

    // Si es vendedor/despachador → filtrar por ruta
    if (!ruta) {
      return res.status(400).json({ msg: "Ruta no especificada" });
    }

    const filtradas = await Ruta.findAll({
      where: { ruta },
      order: [['nombreMostrar', 'ASC']]
    });

    return res.json(filtradas);

  } catch (error) {
    console.error("Error al obtener rutas filtradas:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
}



async function listarRutas(req, res) {
  try {
    const rutas = await obtenerTodasLasRutas();
    return res.json(rutas);
  } catch (error) {
    console.error('Error al listar rutas:', error);
    return res.status(500).json({ error: 'Error al listar rutas' });
  }
}

async function exportarRutasExcel(req, res) {
  try {
    const rutas = await obtenerTodasLasRutas();
    const rutaArchivo = await generarExcelRutas(rutas);

    return res.download(rutaArchivo);
  } catch (error) {
    console.error('Error al exportar rutas a Excel:', error);
    return res.status(500).json({ error: 'Error al exportar Excel' });
  }
}

module.exports = {
  guardarRutas,
  listarRutas,
  obtenerRutasFiltradas,
  exportarRutasExcel
};

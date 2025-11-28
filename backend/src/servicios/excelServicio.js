const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generarExcelRutas(rutas) {
  try {
    // Crear un nuevo libro de trabajo (workbook)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rutas');

    // Agregar encabezados a la hoja
    worksheet.columns = [
      { header: 'RUC', key: 'ruc', width: 20 },
      { header: 'Nombre a Mostrar', key: 'nombreMostrar', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Latitud Geográfica', key: 'latitudGeografica', width: 15 },
      { header: 'Longitud Geográfica', key: 'longitudGeografica', width: 15 },
      { header: 'Zona', key: 'zona', width: 15 },
      { header: 'Ruta', key: 'ruta', width: 10 },
      { header: 'Lunes', key: 'lunes', width: 10 },
      { header: 'Martes', key: 'martes', width: 10 },
      { header: 'Miércoles', key: 'miercoles', width: 10 },
      { header: 'Jueves', key: 'jueves', width: 10 },
      { header: 'Viernes', key: 'viernes', width: 10 },
      { header: 'Sábado', key: 'sabado', width: 10 },
      { header: 'Inactivo', key: 'inactivo', width: 10 },
      { header: 'Novedad', key: 'novedad', width: 30 },
    ];

    // Llenar las filas con los datos de las rutas
    rutas.forEach((ruta) => {
      worksheet.addRow({
        ruc: ruta.ruc,
        nombreMostrar: ruta.nombreMostrar,
        telefono: ruta.telefono,
        categoria: ruta.categoria,
        latitudGeografica: ruta.latitudGeografica,
        longitudGeografica: ruta.longitudGeografica,
        zona: ruta.zona,
        ruta: ruta.ruta,
        lunes: ruta.l ? 'Sí' : 'No',
        martes: ruta.m ? 'Sí' : 'No',
        miercoles: ruta.x ? 'Sí' : 'No',
        jueves: ruta.j ? 'Sí' : 'No',
        viernes: ruta.v ? 'Sí' : 'No',
        sabado: ruta.s ? 'Sí' : 'No',
        inactivo: ruta.inactivo ? 'Sí' : 'No',
        novedad: ruta.novedad || '',
      });
    });

    // Asegúrate de que la carpeta 'uploads' existe
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Guardar el archivo Excel en el servidor
    const filePath = path.join(uploadDir, `rutas_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    console.log(`Archivo Excel generado en: ${filePath}`);

    return filePath; // Retorna la ruta del archivo generado
  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
    throw new Error('No se pudo generar el archivo Excel.');
  }
}

module.exports = {
  generarExcelRutas
};

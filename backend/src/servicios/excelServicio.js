// src/servicios/excelServicio.js
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generarExcelRutas(rutas) {
  try {
    console.log("📄 [EXCEL] Generando archivo Excel de rutas...");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rutas');

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

    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `rutas_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    console.log(`✅ [EXCEL] Archivo generado en: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('❌ [EXCEL] Error al generar el archivo Excel:', error.message);
    throw new Error('No se pudo generar el archivo Excel.');
  }
}

module.exports = {
  generarExcelRutas
};

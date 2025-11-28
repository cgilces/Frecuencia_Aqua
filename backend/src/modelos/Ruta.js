// modelos/Ruta.js
module.exports = (sequelize, DataTypes) => {
  const Ruta = sequelize.define(
    "Ruta",
    {
      ruc: {
        type: DataTypes.TEXT,
        primaryKey: true
      },
      nombreMostrar: {
        type: DataTypes.TEXT,
        field: 'nombre_mostrar'
      },
      telefono: {
        type: DataTypes.TEXT
      },
      categoria: {
        type: DataTypes.TEXT
      },
      latitudGeografica: {
        type: DataTypes.TEXT,
        field: 'latitud_geografica'
      },
      longitudGeografica: {
        type: DataTypes.TEXT,
        field: 'longitud_geografica'
      },
      zona: {
        type: DataTypes.TEXT
      },
      ruta: {
        type: DataTypes.TEXT
      },
      l: { type: DataTypes.BOOLEAN, defaultValue: false },
      m: { type: DataTypes.BOOLEAN, defaultValue: false },
      x: { type: DataTypes.BOOLEAN, defaultValue: false },
      j: { type: DataTypes.BOOLEAN, defaultValue: false },
      v: { type: DataTypes.BOOLEAN, defaultValue: false },
      s: { type: DataTypes.BOOLEAN, defaultValue: false },
      inactivo: { type: DataTypes.BOOLEAN, defaultValue: false },
      novedad: { type: DataTypes.TEXT },
      creadoEn: {
        type: DataTypes.DATE,
        field: 'creado_en',
        defaultValue: DataTypes.NOW
      },
      actualizadoEn: {
        type: DataTypes.DATE,
        field: 'actualizado_en',
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'routes',
      schema: "public",
      timestamps: false
    }
  );

  return Ruta;
};

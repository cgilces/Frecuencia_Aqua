// modelos/LogSincronizacion.js
module.exports = (sequelize, DataTypes) => {
  const LogSincronizacion = sequelize.define(
    "LogSincronizacion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      rutasEnviadas: {
        type: DataTypes.INTEGER,
        field: 'rutas_enviadas'
      },
      detallesEnviados: {
        type: DataTypes.INTEGER,
        field: 'detalles_enviados'
      },
      estado: {
        type: DataTypes.TEXT
      },
      mensaje: {
        type: DataTypes.TEXT
      },
      sessionId: {
        type: DataTypes.TEXT,
        field: 'session_id'
      }
    },
    {
      tableName: 'log_sincronizacion',
      schema: "public",
      timestamps: false
    }
  );

  return LogSincronizacion;
};

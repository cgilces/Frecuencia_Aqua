// modelos/direcciones_clientes.js
module.exports = (sequelize, DataTypes) => {
  const DireccionCliente = sequelize.define(
    "DireccionCliente",
    {
      codigo: {
        type: DataTypes.TEXT,
        primaryKey: true
      },
      codigo_cliente: {
        type: DataTypes.TEXT
      },
      direccion: {
        type: DataTypes.TEXT
      },
      calle_principal: {
        type: DataTypes.TEXT
      },
      calle_secundaria: {
        type: DataTypes.TEXT
      },
      referencia: {
        type: DataTypes.TEXT
      },
      telefono: {
        type: DataTypes.TEXT
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "direcciones_clientes",
      schema: "public",
      timestamps: false
    }
  );

  return DireccionCliente;
};

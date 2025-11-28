// models/cliente.js
module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    codigo: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    identificacion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nombre_empresa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contacto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoria_precio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendedor_asignado: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    saldo: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    fecha_ultima_sincronizacion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'clientes',
    schema: 'public',
    timestamps: false
  });

  return Cliente;
};

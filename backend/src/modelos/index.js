// src/modelos/index.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/baseDatos");

// Importación de modelos
const ClienteModel = require("./clientes");
const DireccionClienteModel = require("./direcciones_clientes");
const UsuarioAppModel = require("./UsuarioApp");
const RutaModel = require("./Ruta");
const LogSincronizacionModel = require("./LogSincronizacion");

// Inicialización
const Cliente = ClienteModel(sequelize, DataTypes);
const DireccionCliente = DireccionClienteModel(sequelize, DataTypes);
const UsuarioApp = UsuarioAppModel(sequelize, DataTypes);
const Ruta = RutaModel(sequelize, DataTypes);
const LogSincronizacion = LogSincronizacionModel(sequelize, DataTypes);

// Relaciones
Cliente.hasMany(DireccionCliente, {
  foreignKey: "codigo_cliente",
  sourceKey: "codigo",
});

DireccionCliente.belongsTo(Cliente, {
  foreignKey: "codigo_cliente",
  targetKey: "codigo",
});

module.exports = {
  sequelize,
  Cliente,
  DireccionCliente,
  UsuarioApp,
  Ruta,
  LogSincronizacion,
};

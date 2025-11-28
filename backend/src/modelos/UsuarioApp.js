// modelos/UsuarioApp.js
module.exports = (sequelize, DataTypes) => {
  const UsuarioApp = sequelize.define(
    "UsuarioApp",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      usuario: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      clave: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      rol: {
        type: DataTypes.ENUM('ADMIN', 'VENDEDOR', 'DESPACHADOR'),
        allowNull: false
      },
      rutasAsignadas: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        field: 'rutas_asignadas',
        allowNull: true
      },
      creadoEn: {
        type: DataTypes.DATE,
        field: 'creado_en',
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'app_users',
      schema: "public",
      timestamps: false
    }
  );

  return UsuarioApp;
};

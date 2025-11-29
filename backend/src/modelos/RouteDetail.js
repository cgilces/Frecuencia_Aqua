module.exports = (sequelize, DataTypes) => {
  const RouteDetail = sequelize.define(
    "RouteDetail",
    {
      code: {
        type: DataTypes.TEXT,
        primaryKey: true
      },
      route_code: {
        type: DataTypes.TEXT
      },
      customer_code: {
        type: DataTypes.TEXT
      },
      customer_address_code: {
        type: DataTypes.TEXT,
        defaultValue: "PRINCIPAL"
      },
      week: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      sequence: {
        type: DataTypes.INTEGER
      },
      day: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: "route_details",
      schema: "public",
      timestamps: false
    }
  );

  return RouteDetail;
};

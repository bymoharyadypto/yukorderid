'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderShippingMethods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderShippingMethods.belongsTo(models.Orders, { foreignKey: 'orderId' });
      OrderShippingMethods.belongsTo(models.Merchants, { foreignKey: 'merchantId', as: 'merchant' });
    }
  }
  OrderShippingMethods.init({
    orderId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER,
    courierName: DataTypes.STRING, // ('JNE', 'J&T', 'SiCepat')
    serviceType: DataTypes.STRING, // ('REG', 'YES', 'ECO')
    shippingCost: DataTypes.INTEGER,
    etd: DataTypes.STRING, // Estimasi waktu sampai (misal '2-3 Hari')
    trackingNumber: DataTypes.STRING,
    shippedAt: DataTypes.DATE,
    deliveredAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'OrderShippingMethods',
  });
  return OrderShippingMethods;
};
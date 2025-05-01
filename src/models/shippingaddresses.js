'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ShippingAddresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ShippingAddresses.belongsTo(models.Orders, {
        foreignKey: 'orderId',
        as: 'order'
      });
    }
  }
  ShippingAddresses.init({
    orderId: DataTypes.INTEGER,
    recipientName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    address: DataTypes.TEXT,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    postalCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ShippingAddresses',
  });
  return ShippingAddresses;
};
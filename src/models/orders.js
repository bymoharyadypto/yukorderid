'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Orders.init({
    userId: DataTypes.INTEGER,
    subtotalAmount: DataTypes.INTEGER,
    shippingCost: DataTypes.INTEGER,
    discountAmount: DataTypes.INTEGER,
    totalAmount: DataTypes.INTEGER,
    status: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    merchantDiscountId: DataTypes.INTEGER,
    isMerchantDiscount: DataTypes.BOOLEAN,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Orders',
  });
  return Orders;
};
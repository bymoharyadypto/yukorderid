'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderItems.init({
    orderId: DataTypes.INTEGER,
    merchantProductId: DataTypes.INTEGER,
    variantId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    merchantDiscountId: DataTypes.INTEGER,
    isPreOrder: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'OrderItems',
  });
  return OrderItems;
};
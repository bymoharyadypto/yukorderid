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
      OrderItems.hasMany(models.MerchantDiscounts, {
        foreignKey: 'merchantDiscountId',
        as: 'merchantDiscounts'
      });
      OrderItems.belongsTo(models.Orders, {
        foreignKey: 'orderId',
        as: 'order'
      });
      OrderItems.belongsTo(models.MerchantProducts, {
        foreignKey: 'productId',
        as: 'product'
      });
      OrderItems.belongsTo(models.MerchantProductVariants, {
        foreignKey: 'variantId',
        as: 'variant'
      });
    }
  }
  OrderItems.init({
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
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
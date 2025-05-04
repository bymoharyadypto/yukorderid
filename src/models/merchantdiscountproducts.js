'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantDiscountProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MerchantDiscountProducts.belongsTo(models.MerchantDiscounts, {
        foreignKey: 'discountId',
        as: 'discount'
      });
      MerchantDiscountProducts.belongsTo(models.MerchantProducts, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  MerchantDiscountProducts.init({
    discountId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MerchantDiscountProducts',
  });
  return MerchantDiscountProducts;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantDiscountProducts extends Model {

    static associate(models) {
      MerchantDiscountProducts.belongsTo(models.MerchantDiscounts, {
        foreignKey: 'merchantDiscountId',
        // as: 'discount'
      });
      // MerchantDiscountProducts.belongsTo(models.MerchantProducts, {
      //   foreignKey: 'merchantProductId',
      //   as: 'product'
      // });
    }
  }
  MerchantDiscountProducts.init({
    merchantDiscountId: DataTypes.INTEGER,
    merchantProductId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MerchantDiscountProducts',
  });
  return MerchantDiscountProducts;
};
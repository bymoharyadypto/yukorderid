'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantDiscountProducts extends Model {

    static associate(models) {
      // define association here
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
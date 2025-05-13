'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantProducts.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
      MerchantProducts.hasMany(models.MerchantProductImages, {
        foreignKey: 'merchantProductId',
        as: 'images'
      });
      MerchantProducts.hasMany(models.MerchantProductVariants, {
        foreignKey: 'merchantProductId',
        as: 'variants'
      });
      MerchantProducts.belongsToMany(models.Categories, {
        through: 'MerchantProductCategories',
        foreignKey: 'merchantProductId',
        otherKey: 'categoryId',
        as: 'categories'
      });
      MerchantProducts.belongsToMany(models.MerchantDiscounts, {
        // through: models.MerchantDiscountProducts,
        through: 'MerchantDiscountProducts',
        foreignKey: 'merchantProductId',
        as: 'discounts'
      });
      MerchantProducts.hasMany(models.MerchantProductVariantOptions, { foreignKey: 'merchantProductId', as: 'variantOptions' });
    }
  }
  MerchantProducts.init({
    merchantId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    crossedPrice: DataTypes.INTEGER,
    stock: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    isPreOrder: DataTypes.BOOLEAN,
    preOrderDays: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MerchantProducts',
  });
  return MerchantProducts;
};
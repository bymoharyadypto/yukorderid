'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantProductVariantOptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantProductVariantOptions.belongsTo(models.MerchantProductVariants, {
        foreignKey: 'merchantProductVariantId',
        as: 'variant'
      });
    }
  }
  MerchantProductVariantOptions.init({
    merchantProductVariantId: DataTypes.INTEGER,
    value: DataTypes.STRING,
    price: DataTypes.INTEGER,
    crossedPrice: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN

  }, {
    sequelize,
    modelName: 'MerchantProductVariantOptions',
  });
  return MerchantProductVariantOptions;
};
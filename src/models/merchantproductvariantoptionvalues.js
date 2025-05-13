'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantProductVariantOptionValues extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantProductVariantOptionValues.belongsTo(models.MerchantProductVariantOptions, { foreignKey: 'merchantProductVariantOptionId' });
      MerchantProductVariantOptionValues.belongsTo(models.MerchantProductVariants, { foreignKey: 'merchantProductVariantId', as: 'variant', });
    }
  }
  MerchantProductVariantOptionValues.init({
    merchantProductVariantOptionId: DataTypes.INTEGER,
    merchantProductVariantId: DataTypes.INTEGER,
    value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MerchantProductVariantOptionValues',
  });
  return MerchantProductVariantOptionValues;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantProductVariants extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantProductVariants.belongsTo(models.MerchantProducts, {
        foreignKey: 'merchantProductId',
        as: 'product'
      });
      // MerchantProductVariants.hasMany(models.MerchantProductVariantOptions, {
      //   foreignKey: 'merchantProductVariantId',
      //   as: 'options'
      // });
      MerchantProductVariants.hasMany(models.MerchantProductVariantOptionValues, { foreignKey: 'merchantProductVariantId' });
    }
  }
  MerchantProductVariants.init({
    merchantProductId: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MerchantProductVariants',
  });
  return MerchantProductVariants;
};
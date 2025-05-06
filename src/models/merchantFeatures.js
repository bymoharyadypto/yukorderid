'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantFeatures extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Features.hasMany(models.PackageFeatures, { foreignKey: 'featureId' });
      MerchantFeatures.belongsToMany(models.MerchantPackages, {
        through: models.MerchantPackageFeatures,
        foreignKey: 'featureId',
        otherKey: 'packageId',
        as: 'packages',
      });
    }
  }
  MerchantFeatures.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'MerchantFeatures',
  });
  return MerchantFeatures;
};
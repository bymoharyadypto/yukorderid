'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantPackages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Packages.hasMany(models.PackageFeatures, { foreignKey: 'packageId' });
      MerchantPackages.belongsToMany(models.MerchantFeatures, {
        through: models.MerchantPackageFeatures,
        foreignKey: 'packageId',
        otherKey: 'featureId',
        as: 'features',
      });

    }
  }
  MerchantPackages.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    durationInDays: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'MerchantPackages',
  });
  return MerchantPackages;
};
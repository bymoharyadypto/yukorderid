'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PackageFeatures extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PackageFeatures.belongsTo(models.Packages, { foreignKey: 'packageId' });
      PackageFeatures.belongsTo(models.Features, { foreignKey: 'featureId' });
    }
  }
  PackageFeatures.init({
    packageId: DataTypes.INTEGER,
    featureId: DataTypes.INTEGER,
    defaultLimit: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PackageFeatures',
  });
  return PackageFeatures;
};
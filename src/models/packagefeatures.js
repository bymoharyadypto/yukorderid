'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantPackageFeatures extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantPackageFeatures.belongsTo(models.MerchantPackages, { foreignKey: 'packageId' });
      MerchantPackageFeatures.belongsTo(models.MerchantFeatures, { foreignKey: 'featureId' });
    }
  }
  MerchantPackageFeatures.init({
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MerchantPackages',
        key: 'id'
      }
    },
    featureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MerchantFeatures',
        key: 'id'
      }
    },
    defaultLimit: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MerchantPackageFeatures',
  });
  return MerchantPackageFeatures;
};
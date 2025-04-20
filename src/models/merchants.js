'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Merchants extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Merchants.hasOne(models.MerchantSubscriptions, { as: 'subscription', foreignKey: 'merchantId' })
      Merchants.hasOne(models.MerchantProfiles, { as: 'merchantProfile', foreignKey: 'merchantId' })
    }
  }
  Merchants.init({
    userId: DataTypes.INTEGER,
    storeName: DataTypes.STRING,
    storeUrl: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Merchants',
  });
  return Merchants;
};
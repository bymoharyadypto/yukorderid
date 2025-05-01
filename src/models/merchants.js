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
      Merchants.hasMany(models.MerchantOperatingHours, { as: 'operatingHours', foreignKey: 'merchantId' })
      Merchants.hasMany(models.MerchantBankAccounts, { as: 'bankAccounts', foreignKey: 'merchantId' })
      Merchants.hasMany(models.MerchantDiscounts, { as: 'discounts', foreignKey: 'merchantId' })
    }
  }
  Merchants.init({
    userId: DataTypes.INTEGER,
    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
        isAlphanumeric: true,
      },
    },
    storeUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      get() {
        const baseUrl = 'https://yukorder.id';
        return `${baseUrl}/${this.getDataValue('subdomain')}`;
      },
    },
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Merchants',
  });
  return Merchants;
};
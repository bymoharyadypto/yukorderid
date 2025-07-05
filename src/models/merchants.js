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
      Merchants.hasMany(models.MerchantProducts, { as: 'products', foreignKey: 'merchantId' });
      Merchants.hasOne(models.MerchantSubscriptions, { as: 'subscription', foreignKey: 'merchantId' });
      Merchants.hasOne(models.MerchantProfiles, { as: 'merchantProfile', foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantOperatingHours, { as: 'operatingHours', foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantBankAccounts, { as: 'bankAccounts', foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantDiscounts, { as: 'discounts', foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantPaymentMethods, { as: 'paymentMethods', foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantQRIS, { as: 'qrisList', foreignKey: 'merchantId' });
      Merchants.hasOne(models.MerchantBalances, { as: 'balance', foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantExpenseCategories, { foreignKey: 'merchantId' });
      Merchants.hasMany(models.MerchantExpenses, { foreignKey: 'merchantId' });
      Merchants.belongsTo(models.Users, { as: 'user', foreignKey: 'userId' });
    }
  }
  Merchants.init({
    userId: DataTypes.INTEGER,
    storeName: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isLowercase: true,
        isAlphanumeric: true,
      },
    },
    storeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isActive: DataTypes.BOOLEAN,
    isBlock: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Merchants',
  });
  return Merchants;
};
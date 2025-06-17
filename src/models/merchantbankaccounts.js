'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantBankAccounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantBankAccounts.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
      });
      MerchantBankAccounts.belongsTo(models.Banks, {
        foreignKey: 'bankId',
      });
      MerchantBankAccounts.hasOne(models.MerchantPaymentMethods, {
        foreignKey: 'referenceId',
        as: 'paymentMethod',
        constraints: false
      });
    }
  }
  MerchantBankAccounts.init({
    merchantId: DataTypes.INTEGER,
    bankId: DataTypes.INTEGER,
    accountNumber: DataTypes.STRING,
    accountHolder: DataTypes.STRING,
    isPrimary: DataTypes.BOOLEAN,
    verifiedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MerchantBankAccounts',
  });
  return MerchantBankAccounts;
};
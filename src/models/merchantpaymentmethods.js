'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantPaymentMethods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MerchantPaymentMethods.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });

      MerchantPaymentMethods.belongsTo(models.MerchantBankAccounts, {
        foreignKey: 'referenceId',
        constraints: false,
        as: 'bankAccount'
      });

      MerchantPaymentMethods.belongsTo(models.MerchantQRIS, {
        foreignKey: 'referenceId',
        constraints: false,
        as: 'qris'
      });

    }
  }
  MerchantPaymentMethods.init({
    merchantId: DataTypes.INTEGER,
    type: DataTypes.STRING, // bank_transfer, qris
    referenceId: DataTypes.INTEGER,
    isEnable: DataTypes.BOOLEAN,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MerchantPaymentMethods',
  });
  return MerchantPaymentMethods;
};
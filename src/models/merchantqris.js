'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantQRIS extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MerchantQRIS.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });

      MerchantQRIS.hasOne(models.MerchantPaymentMethods, {
        foreignKey: 'referenceId',
        as: 'paymentMethod',
        constraints: false
      });

    }
  }
  MerchantQRIS.init({
    merchantId: DataTypes.INTEGER,
    qrisImageUrl: DataTypes.TEXT,
    provider: DataTypes.STRING, // contoh: 'DANA', 'OVO', 'LinkAja'
    referenceName: DataTypes.STRING  // QRIS Resmi / QRIS Ayo Maju
  }, {
    sequelize,
    modelName: 'MerchantQRIS',
  });
  return MerchantQRIS;
};
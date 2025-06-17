'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payments.belongsTo(models.PaymentMethods, { foreignKey: 'paymentMethodId', as: 'method' });
      Payments.hasOne(models.PaymentVerifications, { foreignKey: 'paymentId', as: 'verifications' });
      Payments.hasOne(models.MerchantSubscriptions, { foreignKey: 'orderId', as: 'subscription' });
      Payments.belongsTo(models.Orders, { foreignKey: 'orderId', as: 'order' });
    }
  }
  Payments.init({
    orderId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER,
    paymentChannel: DataTypes.STRING, //('Bank Transfer', 'Credit Card', 'E-Wallet', 'Cash on Delivery')
    paymentReferenceId: DataTypes.STRING, // transaction ID dari Midtrans/Xendit
    amount: DataTypes.INTEGER,
    status: DataTypes.STRING, //('Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled')
    paidAt: DataTypes.DATE,
    expiredAt: DataTypes.DATE,
    paymentLink: DataTypes.STRING,
    invoiceNumber: DataTypes.STRING,
    externalPaymentId: DataTypes.STRING,
    callbackPayload: DataTypes.STRING,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Payments',
  });
  return Payments;
};
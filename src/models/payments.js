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
      Payments.hasOne(models.PaymentVerifications, { foreignKey: 'paymentId', as: 'verification' });
      Payments.hasOne(models.MerchantSubscriptions, { foreignKey: 'orderId', as: 'subscription' });
    }
  }
  Payments.init({
    orderId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER,
    paymentChannel: DataTypes.STRING, //('Bank Transfer', 'Credit Card', 'E-Wallet', 'Cash on Delivery')
    paymentReferenceId: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    status: DataTypes.STRING, //('Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled')
    paidAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payments',
  });
  return Payments;
};
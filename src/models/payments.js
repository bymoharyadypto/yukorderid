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
    }
  }
  Payments.init({
    orderId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER,
    paymentChannel: DataTypes.STRING,
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
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantDiscountPaymentMethods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantDiscountPaymentMethods.belongsTo(models.MerchantDiscounts, {
        foreignKey: 'discountId',
      });

      MerchantDiscountPaymentMethods.belongsTo(models.PaymentMethods, {
        foreignKey: 'paymentMethodId',
      });
    }
  }
  MerchantDiscountPaymentMethods.init({
    discountId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MerchantDiscountPaymentMethods',
  });
  return MerchantDiscountPaymentMethods;
};
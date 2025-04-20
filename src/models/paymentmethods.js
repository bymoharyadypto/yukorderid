'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PaymentMethods.belongsToMany(models.MerchantDiscounts, {
        through: 'MerchantDiscountPaymentMethods',
        as: 'discounts',
        foreignKey: 'paymentMethodId',
        otherKey: 'discountId',
      });
    }
  }
  PaymentMethods.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING, //('bank_transfer', 'ewallet', 'va', 'cod', 'other')
    provider: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PaymentMethods',
  });
  return PaymentMethods;
};
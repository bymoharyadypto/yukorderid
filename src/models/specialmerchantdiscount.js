'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpecialMerchantDiscount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SpecialMerchantDiscount.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
      SpecialMerchantDiscount.belongsToMany(models.PaymentMethods, {
        through: 'MerchantDiscountPaymentMethods',
        as: 'paymentMethods',
        foreignKey: 'merchantDiscountId',
        otherKey: 'paymentMethodId',
      });
      SpecialMerchantDiscount.belongsToMany(models.MerchantProducts, {
        // through: models.MerchantDiscountProducts,
        through: 'MerchantDiscountProducts',
        foreignKey: 'merchantDiscountId',
        as: 'products'
      });
    }
  }
  SpecialMerchantDiscount.init({
    merchantId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    description: DataTypes.TEXT,
    discountType: DataTypes.STRING,
    discountValue: DataTypes.FLOAT,
    budgetPerTransaction: DataTypes.INTEGER,
    isAllProducts: DataTypes.BOOLEAN,
    isAllPayments: DataTypes.BOOLEAN,
    quota: DataTypes.INTEGER,
    paymentType: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SpecialMerchantDiscount',
  });
  return SpecialMerchantDiscount;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantDiscounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MerchantDiscounts.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
      // MerchantDiscounts.belongsToMany(models.PaymentMethods, {
      //   through: 'MerchantDiscountPaymentMethods',
      //   as: 'paymentMethods',
      //   foreignKey: 'merchantDiscountId',
      //   otherKey: 'paymentMethodId',
      // });
      // MerchantDiscounts.belongsToMany(models.MerchantProducts, {
      //   // through: models.MerchantDiscountProducts,
      //   through: 'MerchantDiscountProducts',
      //   foreignKey: 'merchantDiscountId',
      //   as: 'products'
      // });
      MerchantDiscounts.belongsToMany(models.PaymentMethods, {
        through: models.MerchantDiscountPaymentMethods,
        as: 'paymentMethods',
        foreignKey: 'merchantDiscountId',
        otherKey: 'paymentMethodId',
      });
      MerchantDiscounts.belongsToMany(models.MerchantProducts, {
        through: models.MerchantDiscountProducts,
        foreignKey: 'merchantDiscountId',
        otherKey: 'merchantProductId',
        as: 'products'
      });
    }
  }
  MerchantDiscounts.init({
    merchantId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    description: DataTypes.TEXT,
    discountType: DataTypes.STRING, //('percentage', 'fixed')
    discountValue: DataTypes.FLOAT,
    budgetPerTransaction: DataTypes.INTEGER,
    isAllProducts: DataTypes.BOOLEAN,
    isAllPayments: DataTypes.BOOLEAN,
    quota: DataTypes.INTEGER,
    paymentType: DataTypes.STRING, //('all', 'cash', 'transfer', 'cod', 'e-wallet')
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MerchantDiscounts',
  });
  return MerchantDiscounts;
};
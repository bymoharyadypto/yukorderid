'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantExpenses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantExpenses.belongsTo(models.Merchants, { foreignKey: 'merchantId' });
      MerchantExpenses.belongsTo(models.MerchantExpenseCategories, { foreignKey: 'expenseCategoryId' });
    }
  }
  MerchantExpenses.init({
    merchantId: DataTypes.INTEGER,
    expenseCategoryId: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    note: DataTypes.TEXT,
    expenseDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MerchantExpenses',
  });
  return MerchantExpenses;
};
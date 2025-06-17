'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantExpenseCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MerchantExpenseCategories.belongsTo(models.Merchants, { foreignKey: 'merchantId' });
      MerchantExpenseCategories.hasMany(models.MerchantExpenses, { foreignKey: 'expenseCategoryId' });
    }
  }
  MerchantExpenseCategories.init({
    merchantId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    color: DataTypes.STRING,
    logoUrl: DataTypes.TEXT,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MerchantExpenseCategories',
  });
  return MerchantExpenseCategories;
};
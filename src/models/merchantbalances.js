'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantBalances extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantBalances.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
    }
  }
  MerchantBalances.init({
    merchantId: DataTypes.INTEGER,
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pendingWithdraw: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastUpdated: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MerchantBalances',
  });
  return MerchantBalances;
};
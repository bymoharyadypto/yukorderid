'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserWallets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserWallets.init({
    userId: DataTypes.INTEGER,
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING, // 'regular', 'referral_bonus', 'topup', 'cashback'
      defaultValue: 'regular',
    },
    lastUpdated: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserWallets',
  });
  return UserWallets;
};
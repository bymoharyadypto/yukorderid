'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserOtps extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserOtps.init({
    userId: DataTypes.INTEGER,
    identifier: DataTypes.STRING,
    otp: DataTypes.STRING,
    expiresAt: DataTypes.DATE,
    verifiedAt: DataTypes.DATE,
    type: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserOtps',
  });
  return UserOtps;
};
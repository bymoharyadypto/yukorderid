'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerAddresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CustomerAddresses.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  CustomerAddresses.init({
    userId: DataTypes.INTEGER,
    label: DataTypes.STRING,
    recipientName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    province: DataTypes.STRING,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    fullAddress: DataTypes.TEXT,
    isPrimary: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CustomerAddresses',
  });
  return CustomerAddresses;
};
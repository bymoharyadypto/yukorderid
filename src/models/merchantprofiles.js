'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantProfiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MerchantProfiles.init({
    merchantId: DataTypes.INTEGER,
    logo: DataTypes.STRING,
    bannerUrl: DataTypes.STRING,
    address: DataTypes.TEXT,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MerchantProfiles',
  });
  return MerchantProfiles;
};
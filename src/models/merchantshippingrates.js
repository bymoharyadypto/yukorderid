'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantShippingRates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantShippingRates.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
    }
  }
  MerchantShippingRates.init({
    merchantId: DataTypes.INTEGER,
    courierName: DataTypes.STRING, // JNE, J&T, SiCepat
    serviceType: DataTypes.STRING, // REG, YES, ECO
    province: DataTypes.STRING,
    city: DataTypes.STRING,
    baseCost: DataTypes.INTEGER,
    etd: DataTypes.STRING,
    status: DataTypes.STRING // active, inactive
  }, {
    sequelize,
    modelName: 'MerchantShippingRates',
  });
  return MerchantShippingRates;
};
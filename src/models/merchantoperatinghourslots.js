'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantOperatingHourSlots extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantOperatingHourSlots.belongsTo(models.MerchantOperatingHours, {
        foreignKey: 'merchantOperatingHourId',
        as: 'operatingHour'
      });
    }
  }
  MerchantOperatingHourSlots.init({
    merchantOperatingHourId: DataTypes.INTEGER,
    openTime: DataTypes.TIME,
    closeTime: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'MerchantOperatingHourSlots',
  });
  return MerchantOperatingHourSlots;
};
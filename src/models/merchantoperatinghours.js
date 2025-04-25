'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantOperatingHours extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantOperatingHours.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });

      MerchantOperatingHours.hasMany(models.MerchantOperatingHourSlots, {
        foreignKey: 'merchantOperatingHourId',
        as: 'slots',
      });
    }
  }
  MerchantOperatingHours.init({
    merchantId: DataTypes.INTEGER,
    day: DataTypes.STRING,
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is24Hours: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'MerchantOperatingHours',
  });
  return MerchantOperatingHours;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantOffDays extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantOffDays.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
    }
  }
  MerchantOffDays.init({
    merchantId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MerchantOffDays',
  });
  return MerchantOffDays;
};
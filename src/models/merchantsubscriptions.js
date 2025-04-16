'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantSubscriptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantSubscriptions.belongsTo(models.Packages, { foreignKey: 'packageId' });
      MerchantSubscriptions.belongsTo(models.Merchants, { foreignKey: 'merchantId' });
    }
  }
  MerchantSubscriptions.init({
    merchantId: DataTypes.INTEGER,
    packageId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN,
    expiredAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MerchantSubscriptions',
  });
  return MerchantSubscriptions;
};
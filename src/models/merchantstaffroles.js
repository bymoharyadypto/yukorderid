'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantStaffRoles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantStaffRoles.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });
      MerchantStaffRoles.hasMany(models.MerchantStaffs, {
        foreignKey: 'roleId',
        as: 'staffs'
      });
    }
  }
  MerchantStaffRoles.init({
    merchantId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MerchantStaffRoles',
  });
  return MerchantStaffRoles;
};
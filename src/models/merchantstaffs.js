'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantStaffs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantStaffs.belongsTo(models.Merchants, {
        foreignKey: 'merchantId',
        as: 'merchant'
      });

      MerchantStaffs.belongsTo(models.MerchantStaffRoles, {
        foreignKey: 'roleId',
        as: 'role'
      });
    }
  }
  MerchantStaffs.init({
    merchantId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING, //'Active', 'Invited', 'Removed'
      defaultValue: 'Invited'
    }
  }, {
    sequelize,
    modelName: 'MerchantStaffs',
  });
  return MerchantStaffs;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerProfiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CustomerProfiles.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  CustomerProfiles.init({
    userId: DataTypes.INTEGER,
    image: DataTypes.STRING,
    birthDate: DataTypes.DATE,
    gender: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CustomerProfiles',
  });
  return CustomerProfiles;
};
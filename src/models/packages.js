'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Packages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Packages.hasMany(models.PackageFeatures, { foreignKey: 'packageId' });
      Packages.belongsToMany(models.Features, {
        through: models.PackageFeatures,
        foreignKey: 'packageId',
        otherKey: 'featureId',
        as: 'features',
      });

    }
  }
  Packages.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    durationInDays: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Packages',
  });
  return Packages;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Features extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Features.hasMany(models.PackageFeatures, { foreignKey: 'featureId' });
      Features.belongsToMany(models.Packages, {
        through: models.PackageFeatures,
        foreignKey: 'featureId',
        otherKey: 'packageId',
        as: 'packages',
      });
    }
  }
  Features.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Features',
  });
  return Features;
};
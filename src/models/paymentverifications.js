'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentVerifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentVerifications.init({
    paymentId: DataTypes.INTEGER,
    transferProofUrl: DataTypes.STRING,
    uploadedAt: DataTypes.DATE,
    verifiedAt: DataTypes.DATE,
    verifiedBy: DataTypes.INTEGER,
    status: DataTypes.STRING, //('Pending', 'Accepted', 'Rejected')
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PaymentVerifications',
  });
  return PaymentVerifications;
};
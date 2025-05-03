'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderStatusHistories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderStatusHistories.init({
    orderId: DataTypes.INTEGER,
    status: DataTypes.STRING, //('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Expired', 'Refunded', 'Failed')
    changeAt: DataTypes.DATE,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'OrderStatusHistories',
  });
  return OrderStatusHistories;
};
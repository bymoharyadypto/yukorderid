'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Orders.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user'
      });
      Orders.hasMany(models.OrderItems, {
        foreignKey: 'orderId',
        as: 'orderItems'
      });
      Orders.hasMany(models.Payments, {
        foreignKey: 'orderId',
        as: 'payments'
      });
      Orders.hasMany(models.ShippingAddresses, {
        foreignKey: 'orderId',
        as: 'shippingAddresses'
      });
      Orders.belongsTo(models.MerchantDiscounts, {
        foreignKey: 'merchantDiscountId',
        as: 'merchantDiscounts'
      });
      Orders.hasMany(models.OrderShippingMethods, {
        foreignKey: 'orderId',
        as: 'orderShippingMethods'
      });
      Orders.hasMany(models.OrderStatusHistories, {
        foreignKey: 'orderId',
        as: 'orderStatusHistories'
      });
    }
  }
  Orders.init({
    userId: DataTypes.INTEGER,
    // guestOrderInfoId: DataTypes.INTEGER,
    subtotalAmount: DataTypes.INTEGER,
    discountAmount: DataTypes.INTEGER,
    totalAmount: DataTypes.INTEGER,
    status: DataTypes.STRING, // ('Pending', 'Processing', 'Shipped', 'Delivered','Completed', 'Cancelled', 'Refunded')
    userType: DataTypes.STRING, // ('Customer', 'Merchant')
    orderType: DataTypes.STRING, // ('Subscription', '')
    paymentStatus: DataTypes.STRING, // ('Pending', 'Paid', 'Failed', 'Refunded')
    merchantDiscountId: DataTypes.INTEGER,
    isDiscount: DataTypes.BOOLEAN,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Orders',
  });
  return Orders;
};
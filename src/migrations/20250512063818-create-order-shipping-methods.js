'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderShippingMethods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER
      },
      courierName: {
        type: Sequelize.STRING
      },
      serviceType: {
        type: Sequelize.STRING
      },
      shippingCost: {
        type: Sequelize.INTEGER
      },
      etd: {
        type: Sequelize.STRING
      },
      trackingNumber: {
        type: Sequelize.STRING
      },
      shippedAt: {
        type: Sequelize.DATE
      },
      deliveredAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderShippingMethods');
  }
};
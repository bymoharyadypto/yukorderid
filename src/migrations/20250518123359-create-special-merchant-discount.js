'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpecialMerchantDiscounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      merchantId: {
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      discountType: {
        type: Sequelize.STRING
      },
      discountValue: {
        type: Sequelize.FLOAT
      },
      budgetPerTransaction: {
        type: Sequelize.INTEGER
      },
      isAllProducts: {
        type: Sequelize.BOOLEAN
      },
      isAllPayments: {
        type: Sequelize.BOOLEAN
      },
      quota: {
        type: Sequelize.INTEGER
      },
      paymentType: {
        type: Sequelize.STRING
      },
      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
        type: Sequelize.DATE
      },
      isActive: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('SpecialMerchantDiscounts');
  }
};
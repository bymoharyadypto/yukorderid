'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      transactionNumber: {
        type: Sequelize.STRING
      },
      subtotalAmount: {
        type: Sequelize.INTEGER
      },
      shippingCost: {
        type: Sequelize.INTEGER
      },
      discountAmount: {
        type: Sequelize.INTEGER
      },
      totalAmount: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING //('Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled')
      },
      userType: {
        type: Sequelize.STRING //('Customer', 'Merchant')
      },
      orderType: {
        type: Sequelize.STRING //('Normal', 'Subscription')
      },
      paymentStatus: {
        type: Sequelize.STRING //('Pending', 'Paid', 'Failed')
      },
      merchantDiscountId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'MerchantDiscounts',
        //   key: 'id'
        // },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isDiscount: {
        type: Sequelize.BOOLEAN
      },
      note: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};
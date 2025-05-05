'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MerchantProductVariantOptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      merchantProductVariantId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'MerchantProductVariants',
        //   key: 'id'
        // },
        onDelete: 'CASCADE'
      },
      value: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      crossedPrice: {
        type: Sequelize.INTEGER
      },
      stock: {
        type: Sequelize.INTEGER
      },
      isActive: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('MerchantProductVariantOptions');
  }
};
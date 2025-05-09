'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MerchantPackageFeatures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      packageId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'MerchantPackages',
        //   key: 'id'
        // },
        onDelete: 'CASCADE',
        onDelete: 'CASCADE'
      },
      featureId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'MerchantFeatures',
        //   key: 'id'
        // },
        onDelete: 'CASCADE'
      },
      defaultLimit: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('MerchantPackageFeatures');
  }
};
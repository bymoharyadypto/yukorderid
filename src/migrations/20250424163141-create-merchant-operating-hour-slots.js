'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MerchantOperatingHourSlots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      merchantOperatingHourId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'MerchantOperatingHours',
        //   key: 'id'
        // },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      openTime: {
        type: Sequelize.TIME
      },
      closeTime: {
        type: Sequelize.TIME
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
    await queryInterface.dropTable('MerchantOperatingHourSlots');
  }
};
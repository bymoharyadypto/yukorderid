'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserOtps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Users',
        //   key: 'id'
        // },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      identifier: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.STRING
      },
      expiresAt: {
        type: Sequelize.DATE
      },
      verifiedAt: {
        type: Sequelize.DATE
      },
      type: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('UserOtps');
  }
};
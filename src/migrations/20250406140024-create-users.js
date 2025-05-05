'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      },
      repeatPassword: {
        type: Sequelize.STRING
      },
      roleId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Roles',
        //   key: 'id'
        // },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isVerified: {
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
    await queryInterface.dropTable('Users');
  }
};
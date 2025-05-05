'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentVerifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      paymentId: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Payments',
        //   key: 'id'
        // },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transferProofUrl: {
        type: Sequelize.STRING
      },
      uploadedAt: {
        type: Sequelize.DATE
      },
      verifiedAt: {
        type: Sequelize.DATE
      },
      verifiedBy: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING //('Pending', 'Accepted', 'Rejected')
      },
      notes: {
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
    await queryInterface.dropTable('PaymentVerifications');
  }
};
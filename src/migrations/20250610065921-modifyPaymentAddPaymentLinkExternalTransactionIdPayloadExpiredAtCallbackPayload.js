'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payments', 'paymentLink', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Payments', 'invoiceNumber', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Payments', 'expiredAt', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('Payments', 'callbackPayload', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Payments', 'note', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('Payments', 'externalPaymentId', { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Payments', 'paymentLink');
    await queryInterface.removeColumn('Payments', 'invoiceNumber');
    await queryInterface.removeColumn('Payments', 'expiredAt');
    await queryInterface.removeColumn('Payments', 'callbackPayload');
    await queryInterface.removeColumn('Payments', 'note');
    await queryInterface.removeColumn('Payments', 'externalPaymentId');
  }
};

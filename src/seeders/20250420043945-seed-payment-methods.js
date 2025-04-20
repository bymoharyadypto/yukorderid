'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('PaymentMethods', [
      {
        name: 'BCA Bank Transfer',
        type: 'bank_transfer',
        provider: 'BCA',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mandiri Bank Transfer',
        type: 'bank_transfer',
        provider: 'Mandiri',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'BNI Bank Transfer',
        type: 'bank_transfer',
        provider: 'BNI',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'BRI Bank Transfer',
        type: 'bank_transfer',
        provider: 'BRI',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Permata Bank Transfer',
        type: 'bank_transfer',
        provider: 'Permata',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'BCA Virtual Account',
        type: 'va',
        provider: 'BCA',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mandiri Virtual Account',
        type: 'va',
        provider: 'Mandiri',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'BNI Virtual Account',
        type: 'va',
        provider: 'BNI',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'BRI Virtual Account',
        type: 'va',
        provider: 'BRI',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Permata Virtual Account',
        type: 'va',
        provider: 'Permata',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PaymentMethods', null, {});
  }
};

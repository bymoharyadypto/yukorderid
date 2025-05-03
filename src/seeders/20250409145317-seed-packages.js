'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('MerchantPackages', [
      {
        name: 'Free',
        price: 0,
        durationInDays: null,
        description: 'Paket gratis dengan fitur terbatas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Premium',
        price: 150000,
        durationInDays: null,
        description: 'Paket menengah dengan fitur tambahan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Platinum',
        price: 300000,
        durationInDays: null,
        description: 'Paket lengkap dengan semua fitur',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('MerchantPackages', null, {});
  }
};

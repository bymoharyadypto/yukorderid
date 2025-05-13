'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('MerchantShippingRates', [
      {
        merchantId: 1,
        courierName: 'JNE',
        serviceType: 'REG',
        province: 'DKI Jakarta',
        city: null,
        baseCost: 10000,
        etd: '1-2 Hari',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        merchantId: 1,
        courierName: 'JNE',
        serviceType: 'REG',
        province: 'Jawa Barat',
        city: null,
        baseCost: 12000,
        etd: '2-3 Hari',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        merchantId: 1,
        courierName: 'JNE',
        serviceType: 'REG',
        province: "Jawa Tengah",
        city: null,
        baseCost: 15000,
        etd: '3-4 Hari',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('MerchantShippingRates', null, {});
  }
};

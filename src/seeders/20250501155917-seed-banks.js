'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Banks', [
      {
        code: 'MANDIRI',
        name: 'Bank Mandiri',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'BCA',
        name: 'Bank BCA',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'BNI',
        name: 'Bank BNI',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'BRI',
        name: 'Bank BRI',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'BTN',
        name: 'Bank BTN',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'CIMB',
        name: 'CIMB Niaga',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },


  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Banks', null, {});
  }
};

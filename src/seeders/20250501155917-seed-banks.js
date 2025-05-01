'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('banks', [
      {
        code: 'MANDIRI',
        name: 'Bank Mandiri',
        logo_url: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'BCA',
        name: 'Bank BCA',
        logo_url: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'BNI',
        name: 'Bank BNI',
        logo_url: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'BRI',
        name: 'Bank BRI',
        logo_url: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'BTN',
        name: 'Bank BTN',
        logo_url: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        code: 'CIMB',
        name: 'CIMB Niaga',
        logo_url: '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },


  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('banks', null, {});
  }
};

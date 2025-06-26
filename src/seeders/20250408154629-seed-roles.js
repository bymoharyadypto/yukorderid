'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'merchant',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'creator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'fasilitator',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};

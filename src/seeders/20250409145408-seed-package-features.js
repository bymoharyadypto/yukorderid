'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('MerchantPackageFeatures', [
      // Free
      { packageId: 1, featureId: 1, defaultLimit: 4, createdAt: new Date(), updatedAt: new Date() },
      // { packageId: 1, featureId: 2, defaultLimit: 2, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 1, featureId: 3, defaultLimit: 1, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 1, featureId: 4, defaultLimit: 1, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 1, featureId: 9, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 1, featureId: 10, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },

      // Premium
      { packageId: 2, featureId: 1, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 2, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 3, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 4, defaultLimit: 3, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 5, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 6, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 9, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 2, featureId: 10, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },

      // Platinum
      { packageId: 3, featureId: 1, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 2, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 3, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 4, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 5, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 6, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 7, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 8, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 9, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
      { packageId: 3, featureId: 10, defaultLimit: null, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('MerchantPackageFeatures', null, {});
  }
};

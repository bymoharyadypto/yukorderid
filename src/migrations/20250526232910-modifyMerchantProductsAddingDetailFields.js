'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MerchantProducts', 'weight', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('MerchantProducts', 'size', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('MerchantProducts', 'packaging', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('MerchantProducts', 'weight');
    await queryInterface.removeColumn('MerchantProducts', 'size');
    await queryInterface.removeColumn('MerchantProducts', 'dimensions');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      { key: 'user.create', description: 'Create user' },
      { key: 'user.edit', description: 'Edit user' },
      { key: 'user.change_permission', description: 'Change user permission' },
      { key: 'user.delete', description: 'Delete user' },
      { key: 'merchant.change_plan_expired', description: 'Change plan expired' },
      { key: 'merchant.change_plan', description: 'Change plan' },
      { key: 'merchant.block', description: 'Block merchant' },
      { key: 'product.hide', description: 'Hide product' },
      { key: 'product.delete', description: 'Delete product' },
      { key: 'customer.view_transaction', description: 'View transaction' },
      { key: 'customer.delete_account', description: 'Delete customer account' },
    ];

    await queryInterface.bulkInsert('Permissions', permissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};

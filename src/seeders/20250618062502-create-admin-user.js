'use strict';
const bcrypt = require('bcryptjs');
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = 'admin123'; // default password
    const hashedPassword = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('Users', [{
      name: 'admin',
      email: 'admin@mail.com',
      phoneNumber: '081234567890',
      password: hashedPassword,
      repeatPassword: null,
      roleId: 1,
      isVerified: true,
      isBlock: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@mail.com' }, {});
  }
};

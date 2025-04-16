'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Features', [
      { name: 'Maksimal Produk', description: 'Jumlah produk yang dapat dibuat', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kategori Produk', description: 'Jumlah kategori produk', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Metode Pembayaran', description: 'Jumlah metode pembayaran', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Akun Staff', description: 'Jumlah akun staff', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Fitur Kostumisasi', description: 'Kemampuan kostumisasi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sales & Cost Report', description: 'Laporan penjualan & biaya', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Fitur Diskon', description: 'Fitur pemberian diskon', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Expanse Management', description: 'Manajemen pengeluaran', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Order Report', description: 'Laporan pesanan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Order Notifikasi', description: 'Notifikasi pesanan', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Features', null, {});
  }
};

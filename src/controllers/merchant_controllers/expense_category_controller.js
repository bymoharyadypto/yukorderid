const db = require('../../models');
const { Op } = require('sequelize');

class ExpenseCategoryController {

    static async createExpenseCategory(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, color, logoUrl } = req.body;
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const existing = await db.MerchantExpenseCategories.findOne({
                where: { merchantId, name: { [Op.like]: `%${name}%` }, isActive: true },
                transaction
            });

            if (existing) {
                return res.status(400).json({ message: 'Kategori dengan nama yang sama sudah ada' });
            }

            const category = await db.MerchantExpenseCategories.create({
                merchantId,
                name,
                color: color ?? null,
                logoUrl: logoUrl ?? null,
                isActive: true,
            }, { transaction });

            await transaction.commit();

            return res.status(201).json({ message: 'Kategori pengeluaran berhasil dibuat', data: category });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    static async updateExpenseCategory(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, color, logoUrl } = req.body;
            const userId = req.user?.id;
            const { merchantId, expenseCategoryId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const category = await db.MerchantExpenseCategories.findOne({
                where: { id: expenseCategoryId, merchantId: merchant.id, isActive: true },
                transaction
            });

            if (!category) {
                return res.status(404).json({ message: 'Kategori pengeluaran tidak ditemukan' });
            }

            category.name = name || category.name;
            category.color = color || category.color;
            category.logoUrl = logoUrl || category.logoUrl;

            await category.save({ transaction });

            await transaction.commit();

            return res.status(200).json({ message: 'Kategori pengeluaran berhasil diperbarui', data: category });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    static async updateExpenseCategoryStatus(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { isActive } = req.body;
            const userId = req.user?.id;
            const { merchantId, expenseCategoryId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const category = await db.MerchantExpenseCategories.findOne({
                where: { id: expenseCategoryId, merchantId: merchant.id, isActive: true },
                transaction
            });

            if (!category) {
                return res.status(404).json({ message: 'Kategori pengeluaran tidak ditemukan' });
            }

            await category.update({ isActive }, { transaction });

            await transaction.commit();

            return res.status(200).json({ message: 'Status kategori pengeluaran berhasil diperbarui', data: category });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    static async getExpenseCategories(req, res) {
        const userId = req.user?.id;
        const { merchantId } = req.params;

        const merchant = await db.Merchants.findOne({
            where: { id: merchantId, userId, isActive: true },
        });

        if (!merchant) {
            return res.status(403).json({ message: 'Merchant tidak ditemukan' });
        }

        const categories = await db.MerchantExpenseCategories.findAll({
            where: { merchantId: merchant.id, isActive: true },
        });

        return res.status(200).json({ message: 'Berhasil mengambil semua kategori pengeluaran', data: categories });
    };
}

module.exports = ExpenseCategoryController
const db = require('../../models');
const dayjs = require("dayjs");

class ExpenseController {

    static async createExpense(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { expenseDate, amount, expenseCategoryId, note } = req.body;
            const userId = req.user?.id;
            const { merchantId } = req.params;

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

            const formattedDate = dayjs(expenseDate).format("YYYY-MM-DD");

            const expense = await db.MerchantExpenses.create({
                merchantId,
                expenseDate: formattedDate,
                amount,
                expenseCategoryId: category.id,
                note: note ?? null
            }, { transaction });

            await transaction.commit();
            return res.status(201).json({ message: 'Berhasil membuat pengeluaran', data: expense });
        } catch (error) {
            console.error(error);
            await transaction.rollback();
            return res.status(500).json(error)
        }
    };

    static async getAllExpense(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const expense = await db.MerchantExpenses.findAll({
                where: { merchantId: merchant.id, },
                include: [
                    {
                        model: db.MerchantExpenseCategories,
                        attributes: ['id', 'name', 'color', 'logoUrl']
                    }
                ],
                order: [['expenseDate', 'DESC']],
                transaction
            })
            await transaction.commit();
            return res.status(200).json({ message: 'Berhasil mengambil data pengeluaran', data: expense });
        } catch (error) {
            console.error(error);
            await transaction.rollback();
            return res.status(500).json(error)
        }
    };

    static async updateExpense(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { expenseDate, amount, expenseCategoryId, note } = req.body;
            const userId = req.user?.id;
            const { merchantId, expenseId } = req.params;

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

            const expense = await db.MerchantExpenses.findOne({
                where: { id: expenseId, merchantId: merchant.id },
                transaction
            });

            if (!expense) {
                return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' });
            }
            const formattedDate = dayjs(expenseDate).format("YYYY-MM-DD");

            await expense.update({ expenseDate: formattedDate, amount, expenseCategoryId: category.id, note }, { transaction });

            await transaction.commit();
            return res.status(200).json({ message: 'Berhasil memperbarui pengeluaran', data: expense });
        } catch (error) {
            console.error(error);
            await transaction.rollback();
            return res.status(500).json(error)
        }
    };

}

module.exports = ExpenseController
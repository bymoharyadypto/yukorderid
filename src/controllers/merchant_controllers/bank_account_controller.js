const db = require('../../models');

class MerchantBankAccountsController {
    static async createMerchantBankAccount(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;
            const { bankId, accountNumber, accountHolder, isPrimary = false } = req.body;

            const merchant = await db.Merchants.findOne({ where: { id: merchantId, userId, isActive: true } });

            if (!merchant) {
                return res.status(403).json({ success: false, message: 'Merchant tidak ditemukan atau tidak aktif' });
            }

            const bank = await db.Banks.findOne({ where: { id: bankId, isActive: true } });
            if (!bank) {
                return res.status(400).json({ success: false, message: 'Bank tidak valid atau tidak aktif' });
            }

            if (isPrimary) {
                await db.MerchantBankAccounts.update(
                    { isPrimary: false },
                    { where: { merchantId } }
                );
            }

            const newAccount = await db.MerchantBankAccounts.create({
                merchantId,
                bankId,
                accountNumber,
                accountHolder,
                isPrimary: !!isPrimary,
                verifiedAt: new Date(),
            });

            return res.status(201).json({
                success: true,
                message: 'Akun bank merchant berhasil ditambahkan',
                data: newAccount,
            });
        } catch (error) {
            console.error('Gagal membuat akun bank merchant:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal membuat akun bank merchant',
                error: error.message,
            });
        }
    }

    static async getAllMerchantBankAccounts(req, res) {
        try {
            const userId = req.user?.id;
            const merchantId = req.params.merchantId;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });
            if (!merchant) {
                return res.status(403).json({ success: false, message: 'Merchant tidak ditemukan atau tidak aktif' });
            }

            const accounts = await db.MerchantBankAccounts.findAll({
                where: { merchantId },
                include: [{ model: db.Banks, attributes: ['id', 'name', 'code', 'logoUrl'] }],
                order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']],
            });

            return res.status(200).json({ success: true, data: accounts });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data akun bank' });
        }
    }

    static async getMerchantBankAccountById(req, res) {
        try {
            const userId = req.user?.id;
            const { bankAccountId } = req.params;

            const account = await db.MerchantBankAccounts.findOne({
                where: { id: bankAccountId },
                include: [
                    {
                        model: db.Merchants,
                        where: { userId, isActive: true },
                        attributes: [],
                    },
                    {
                        model: db.Banks,
                        attributes: ['id', 'name', 'code', 'logoUrl'],
                    },
                ],
            });

            if (!account) {
                return res.status(404).json({ success: false, message: 'Akun bank tidak ditemukan' });
            }

            return res.status(200).json({ success: true, data: account });
        } catch (error) {
            console.error('Gagal mengambil detail akun bank:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil detail akun bank' });
        }
    }

    static async setPrimaryBankAccount(req, res) {
        const { bankAccountId } = req.params;

        try {
            const bankAccount = await db.MerchantBankAccounts.findOne({
                where: { id: bankAccountId },
                include: [{ model: db.Merchants, where: { userId, isActive: true }, attributes: [] }],
            });

            if (!bankAccount) {
                return res.status(404).json({ success: false, message: 'Akun bank tidak ditemukan atau bukan milik Anda' });
            }

            await db.MerchantBankAccounts.update(
                { isPrimary: false },
                { where: { merchantId: bankAccount.merchantId } }
            );

            await bankAccount.update({ isPrimary: true });

            return res.status(200).json({
                message: 'Akun bank merchant berhasil diatur sebagai utama',
                data: bankAccount
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Gagal mengatur akun bank merchant' });
        }
    }

    static async deleteMerchantBankAccount(req, res) {
        const { bankAccountId } = req.params;

        try {
            const bankAccount = await db.MerchantBankAccounts.findOne({
                where: { id: bankAccountId },
                include: [{ model: db.Merchants, where: { userId, isActive: true }, attributes: [] }],
            });

            if (!bankAccount) {
                return res.status(404).json({ message: 'Bank account not found' });
            }

            await bankAccount.destroy();

            return res.status(200).json({
                message: 'Merchant bank account deleted successfully'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

}

module.exports = MerchantBankAccountsController;
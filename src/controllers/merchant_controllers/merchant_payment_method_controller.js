const db = require('../../models');

class MerchantPaymentMethodController {
    static async getMerchantPaymentMethodList(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;

            if (!merchantId) {
                return res.status(400).json({ success: false, message: 'merchantId is required' });
            }

            const merchant = await db.Merchants.findOne({ where: { id: merchantId, userId, isActive: true } });

            if (!merchant) {
                return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            }

            const paymentMethods = await db.MerchantPaymentMethods.findAll({
                where: {
                    merchantId: merchant.id,
                    deletedAt: null
                },
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: db.MerchantBankAccounts,
                        as: 'bankAccount',
                        include: [{ model: db.Banks }],
                        required: false
                    },
                    {
                        model: db.MerchantQRIS,
                        as: 'qris',
                        required: false
                    }
                ]
            });

            const cleanedData = paymentMethods.map(pm => {
                const cleaned = {
                    ...pm.toJSON(),
                    bankAccount: pm.type === 'bank_transfer' ? pm.bankAccount : null,
                    qris: pm.type === 'qris' ? pm.qris : null,
                };
                return cleaned;
            });

            return res.status(200).json({
                success: true,
                message: 'Metode pembayaran merchant berhasil diambil',
                data: cleanedData
            });
        } catch (error) {
            console.error('Gagal mengambil daftar metode pembayaran:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil daftar metode pembayaran',
                error: error.message
            });
        }
    }

    static async updateMerchantPaymentMethodStatus(req, res) {
        const t = await db.sequelize.transaction();
        try {
            const userId = req.user?.id;
            const { merchantId, methodId } = req.params;
            const { isEnable } = req.body;

            if (!merchantId || !methodId) {
                return res.status(400).json({ success: false, message: 'merchantId dan methodId wajib diisi' });
            }

            if (typeof isEnable !== 'boolean') {
                return res.status(400).json({ success: false, message: 'isEnable harus berupa boolean' });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction: t
            });

            if (!merchant) {
                return res.status(403).json({ success: false, message: 'Merchant tidak ditemukan atau tidak aktif' });
            }

            const method = await db.MerchantPaymentMethods.findOne({
                where: {
                    id: methodId,
                    merchantId: merchant.id,
                    deletedAt: null
                },
                transaction: t
            });

            if (!method) {
                return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
            }

            await method.update({ isEnable }, { transaction: t });

            await t.commit();

            return res.status(200).json({
                success: true,
                message: 'Status metode pembayaran berhasil diperbarui',
                data: method
            });
        } catch (error) {
            await t.rollback();
            console.error('Gagal mengupdate status metode pembayaran:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengupdate status metode pembayaran',
                error: error.message
            });
        }
    }

}

module.exports = MerchantPaymentMethodController;
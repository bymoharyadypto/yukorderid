const db = require('../../models');

class MerchantQRISController {
    static async createMerchantQRIS(req, res) {
        const t = await db.sequelize.transaction();
        try {
            const { qrisImageUrl, provider, referenceName } = req.body;
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({ where: { id: merchantId, userId, isActive: true }, transaction: t });

            if (!merchant) {
                return res.status(403).json({ success: false, message: 'Merchant tidak ditemukan atau tidak aktif' });
            }

            const newQris = await db.MerchantQRIS.create({
                merchantId: merchant.id,
                qrisImageUrl,
                provider,
                referenceName
            }, { transaction: t });

            const newPaymentMethod = await db.MerchantPaymentMethods.create({
                merchantId: merchant.id,
                type: 'qris',
                referenceId: newQris.id,
                isEnable: true,
            }, { transaction: t });

            await t.commit();

            return res.status(201).json({
                message: 'QRIS merchant berhasil dibuat',
                data: {
                    qris: newQris,
                    paymentMethod: newPaymentMethod
                }
            });
        } catch (error) {
            await t.rollback();
            console.error('Gagal membuat QRIS merchant:', error);
            return res.status(500).json({ message: 'Gagal membuat QRIS merchant' });
        }
    }

    static async getAllQRISByMerchant(req, res) {
        try {
            const userId = req.user?.id;
            const merchantId = req.params.merchantId;

            if (!merchantId) {
                return res.status(400).json({ message: 'merchantId is required' });
            }
            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });
            if (!merchant) {
                return res.status(403).json({ success: false, message: 'Merchant tidak ditemukan atau tidak aktif' });
            }

            const list = await db.MerchantQRIS.findAll({
                where: { merchantId: merchant.id },
                order: [['createdAt', 'DESC']],
            });

            return res.status(200).json({
                success: true,
                data: list
            });
        } catch (error) {
            console.error('Gagal mengambil data QRIS:', error);
            return res.status(500).json({ message: 'Gagal mengambil data QRIS' });
        }
    }

    static async getQRISById(req, res) {
        try {
            const { qrisId } = req.params;
            const userId = req.user?.id;

            const qris = await db.MerchantQRIS.findOne({
                where: { id: qrisId },
                include: [{ model: db.Merchants, where: { userId, isActive: true }, attributes: [] }],
            });

            if (!qris) {
                return res.status(404).json({ message: 'QRIS not found' });
            }

            return res.status(200).json({
                success: true,
                data: qris
            });
        } catch (error) {
            console.error('Error fetching QRIS by ID:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = MerchantQRISController;

const db = require('../../models');
const { Op } = require('sequelize');

class ShippingRateController {

    static async getMerchantShippingRates(req, res) {
        try {
            const { merchantId } = req.params;
            const { id: userId } = req.user;
            const { city, province, status } = req.query;

            const merchantIds = req.user?.merchantIds;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan atau tidak aktif' });
            }

            if (!Array.isArray(merchantIds) || !merchantIds.includes(merchant.id)) {
                return res.status(403).json({ message: 'Akses ke merchant tidak diizinkan atau merchant tidak ditemukan' });
            }

            const filters = { merchantId: merchant.id };

            if (city) filters.city = { [Op.iLike]: city };
            if (province) filters.province = { [Op.iLike]: province };
            if (status) filters.status = status;

            const shippingRates = await db.MerchantShippingRates.findAll({
                where: filters,
                order: [['courierName', 'ASC'], ['serviceType', 'ASC']],
            });

            return res.status(200).json({ data: shippingRates });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data ongkir merchant' });
        }
    }

    static async createMerchantShippingRates(req, res) {
        try {
            const { merchantId } = req.params;
            const { id: userId } = req.user;

            const {
                courierName,
                serviceType,
                province,
                city,
                baseCost,
                etd,
                status = 'active'
            } = req.body;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) return res.status(404).json({ error: 'Merchant tidak ditemukan' });

            const existingRate = await db.MerchantShippingRates.findOne({
                where: {
                    merchantId,
                    courierName,
                    serviceType,
                    province,
                    city
                }
            });

            if (existingRate) {
                return res.status(400).json({ error: 'Tarif pengiriman sudah terdaftar untuk kombinasi ini' });
            }

            const newRate = await db.MerchantShippingRates.create({
                merchantId,
                courierName,
                serviceType,
                province,
                city,
                baseCost,
                etd,
                status
            });

            return res.status(201).json({ message: 'Tarif pengiriman berhasil ditambahkan', data: newRate });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menambahkan tarif pengiriman' });
        }
    }
}

module.exports = ShippingRateController
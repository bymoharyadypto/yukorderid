const db = require('../../models');
const { Op } = require('sequelize');

class PublicController {
    // static extractSubdomain(req) {
    //     const host = req.headers.host;
    //     const parts = host.split('.');
    //     if (parts.length >= 3) return parts[0];
    //     return null;
    // }
    static async getAllCategories(req, res) {
        try {
            const categories = await db.Categories.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });

            return res.status(200).json({ categories });
        } catch (err) {
            console.error('Gagal mengambil kategori:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }


    static async getProductsBySubdomain(req, res) {
        try {
            const subdomain = req.params.subdomain;

            if (!subdomain) {
                return res.status(400).json({ message: 'Subdomain tidak valid.' });
            }

            const merchant = await db.Merchants.findOne({
                where: { subdomain, isActive: true }
            });

            if (!merchant) {
                return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            }

            const whereCondition = { merchantId: merchant.id, deletedAt: null };
            if (req.query.isActive) {
                whereCondition.isActive = req.query.isActive === 'true';
            }

            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;

            const products = await db.MerchantProducts.findAll({
                where: whereCondition,
                attributes: ['id', 'name', 'description', "weight", "dimensions", "packaging", 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
                include: [
                    {
                        model: db.MerchantDiscounts,
                        as: 'discounts',
                        attributes: ['id', 'code', 'description', 'discountType', 'discountValue', 'startDate', 'endDate', 'isActive'],
                        through: { attributes: [] },
                        required: false
                    },
                    {
                        model: db.MerchantProductImages,
                        as: 'images',
                        attributes: ['id', 'imageUrl']
                    },
                    {
                        model: db.Categories,
                        as: 'categories',
                        attributes: ['id', 'name'],
                        through: { attributes: [] },
                        ...(categoryId && {
                            where: { id: categoryId },
                            required: true
                        })
                    },
                    {
                        model: db.MerchantProductVariants,
                        as: 'variants',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: db.MerchantProductVariantOptions,
                        as: 'variantOptions',
                        attributes: ['id', 'price', 'crossedPrice', 'stock', 'isActive'],
                        include: [
                            {
                                model: db.MerchantProductVariantOptionValues,
                                as: 'optionValues',
                                attributes: ['id', 'value'],
                                include: [
                                    {
                                        model: db.MerchantProductVariants,
                                        as: 'variant',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    },
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                merchant: {
                    id: merchant.id,
                    name: merchant.storeName,
                    subdomain: merchant.subdomain,
                },
                products
            });

        } catch (err) {
            console.error('Gagal mengambil produk:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }

    static async getMerchantBySubdomain(req, res) {
        try {
            const subdomain = req.params.subdomain;

            if (!subdomain || !/^[a-z0-9]+$/i.test(subdomain)) {
                return res.status(400).json({ message: 'Subdomain tidak valid.' });
            }

            const merchant = await db.Merchants.findOne({
                where: { subdomain, isActive: true },
                attributes: ['id', 'storeName', 'storeUrl', 'subdomain', 'isActive'],
                include: [
                    {
                        model: db.MerchantProfiles,
                        as: 'merchantProfile',
                        attributes: ['id', 'logo', 'subText', 'bannerUrl', 'address', 'phone', 'district', 'city', 'province']
                    },
                    {
                        model: db.MerchantSubscriptions,
                        as: 'subscription',
                        attributes: ['id', 'startDate', 'endDate', 'isActive', 'expiredAt'],
                        include: [
                            {
                                model: db.MerchantPackages,
                                as: 'package',
                                attributes: ['id', 'name', 'price', 'durationInDays', 'description'],
                                include: [
                                    {
                                        model: db.MerchantFeatures,
                                        as: 'features',
                                        attributes: ['id', 'name', 'description'],
                                        through: {
                                            model: db.MerchantPackageFeatures,
                                            attributes: []
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.MerchantOperatingHours,
                        as: 'operatingHours',
                        attributes: ['id', 'day', 'isOpen', 'is24Hours'],
                        order: [['id', 'ASC']],
                        required: false,
                        include: {
                            model: db.MerchantOperatingHourSlots,
                            as: 'slots',
                            attributes: ['id', 'openTime', 'closeTime']
                        }
                    },
                    {
                        model: db.MerchantBankAccounts,
                        as: 'bankAccounts',
                        attributes: ['id', 'bankId', 'accountNumber', 'accountHolder', "isPrimary"],
                        required: false,
                        include: [
                            {
                                model: db.Banks,
                                attributes: ['id', 'name', 'code']
                            }
                        ],
                        where: { isPrimary: true },
                    }
                ]
            });

            if (!merchant) {
                return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            }

            return res.status(200).json({ merchant });

        } catch (err) {
            console.error('Gagal mengambil data merchant:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }

    static async getMerchantPaymentMethodList(req, res) {
        try {
            const subdomain = req.params.subdomain;

            if (!subdomain) {
                return res.status(400).json({ message: 'Subdomain tidak valid.' });
            }

            const merchant = await db.Merchants.findOne({
                where: { subdomain, isActive: true }
            });

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

}
module.exports = PublicController;



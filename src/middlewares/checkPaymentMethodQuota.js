const db = require("../models");
const checkMerchantQuota = require("./checkMerchantQuota");


const checkMerchantPaymentMethodQuota = async (req, res, next) => {
    try {
        const merchantId = req.params.merchantId || req.body.merchantId;

        if (!merchantId) {
            return res.status(400).json({ message: "merchantId tidak ditemukan di request" });
        }

        const merchant = await db.Merchants.findOne({
            where: { id: merchantId },
            include: [
                {
                    model: db.MerchantSubscriptions,
                    as: 'subscription',
                    where: { isActive: true },
                    include: [
                        {
                            model: db.MerchantPackages,
                            as: 'package',
                            include: [
                                {
                                    model: db.MerchantFeatures,
                                    as: 'features',
                                    attributes: ['id', 'name'],
                                    through: { model: db.PackageFeatures, attributes: ['defaultLimit'], as: 'packages' }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!merchant || !merchant.subscription || !merchant.subscription.package) {
            return res.status(403).json({ message: "Paket langganan tidak aktif atau Merchant tidak ditemukan" });
        }

        const features = merchant.subscription.package.features || [];

        // // Ambil limit berdasarkan fitur
        // const getLimit = (featureName) => {
        //     const feature = features.find(f => f.name === featureName);
        //     return feature?.MerchantPackageFeatures?.defaultLimit ?? 0;
        // };

        // const bankTransferLimit = getLimit('bank_transfer');
        // const qrisLimit = getLimit('qris');

        // const [bankCount, qrisCount] = await Promise.all([
        //     db.MerchantPaymentMethods.count({
        //         where: {
        //             merchantId,
        //             type: 'bank_transfer',
        //             deletedAt: null
        //         }
        //     }),
        //     db.MerchantPaymentMethods.count({
        //         where: {
        //             merchantId,
        //             type: 'qris',
        //             deletedAt: null
        //         }
        //     })
        // ]);

        // if (bankCount >= bankTransferLimit) {
        //     return res.status(403).json({ message: `Jumlah bank transfer melebihi limit (${bankTransferLimit}) untuk paket kamu.` });
        // }

        // if (qrisCount >= qrisLimit) {
        //     return res.status(403).json({ message: `Jumlah QRIS melebihi limit (${qrisLimit}) untuk paket kamu.` });
        // }
        const paymentMethodLimit = features.find(f => f.name === 'payment_method')?.MerchantPackageFeatures?.defaultLimit ?? 0;

        const totalPaymentMethodCount = await db.MerchantPaymentMethods.count({
            where: {
                merchantId,
                deletedAt: null
            }
        });

        if (totalPaymentMethodCount >= paymentMethodLimit) {
            return res.status(403).json({ message: `Jumlah metode pembayaran telah mencapai batas maksimum (${paymentMethodLimit}) sesuai paket kamu.` });
        }

        next();
    } catch (err) {
        console.error('validateMerchantPaymentMethodLimit error:', err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

module.exports = checkMerchantPaymentMethodQuota;

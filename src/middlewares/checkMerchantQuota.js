const db = require("../models");

const checkMerchantQuota = (featureName, countModel, countWhere = {}) => {
    return async (req, res, next) => {
        try {
            const merchantId = req.params.merchantId || req.body.merchantId;
            const userId = req.user?.id;

            if (!merchantId) {
                return res.status(400).json({ message: "merchantId tidak ditemukan di request" });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
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
                                        through: { model: db.PackageFeatures, attributes: ['defaultLimit'], as: 'packages' }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!merchant || !merchant.subscription || !merchant.subscription.package) {
                return res.status(403).json({ message: "Paket langganan tidak aktif atau tidak ditemukan" });
            }

            const features = merchant.subscription.package.features || [];
            const matchedFeature = features.find((f) => f.name === featureName);

            if (!matchedFeature) {
                return res.status(403).json({ message: `Fitur "${featureName}" tidak tersedia di paket kamu` });
            }

            const limit = matchedFeature.packages.defaultLimit;

            const count = await db[countModel].count({
                where: { merchantId, ...countWhere }
            });

            if (limit !== null && limit !== "unlimited" && count >= limit) {
                return res.status(403).json({ message: `Kuota ${featureName} kamu telah mencapai batas maksimal (${limit})` });
            }

            next();
        } catch (error) {
            console.error("checkMerchantQuota error:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };
};

module.exports = checkMerchantQuota;

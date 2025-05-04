const db = require("../models");

const checkMerchantFeature = (featureName) => async (req, res, next) => {
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
                                    attributes: ['id', 'name', 'description'],
                                    through: {
                                        model: db.MerchantPackageFeatures,
                                        attributes: ['defaultLimit'],
                                    },
                                },
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

        next();
    } catch (error) {
        console.error("checkMerchantFeature error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = checkMerchantFeature;

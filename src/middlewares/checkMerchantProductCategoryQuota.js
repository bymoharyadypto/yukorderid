const db = require("../models");

const checkUsedProductCategoryQuotaV1 = (featureName) => {
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
                                        through: {
                                            model: db.PackageFeatures,
                                            attributes: ['defaultLimit'],
                                            as: 'packages'
                                        }
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
            const matchedFeature = features.find(f => f.name === featureName);

            if (!matchedFeature) {
                return res.status(403).json({ message: `Fitur "${featureName}" tidak tersedia di paket kamu` });
            }

            const limit = matchedFeature.packages?.defaultLimit;

            const [results] = await db.sequelize.query(
                `
                SELECT COUNT(DISTINCT mpc.categoryId) as usedCount
                FROM \`MerchantProductCategories\` mpc
                JOIN \`MerchantProducts\` mp ON mp.id = mpc.\`merchantProductId\`
                WHERE mp.\`merchantId\` = :merchantId
                `,
                {
                    replacements: { merchantId },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const usedCount = results.usedcount || results.usedCount || 0;

            if (limit !== null && limit !== "unlimited" && usedCount >= limit) {
                return res.status(403).json({
                    message: `Jumlah kategori produk kamu telah mencapai batas maksimal (${limit})`
                });
            }

            next();
        } catch (error) {
            console.error("checkUsedProductCategoryQuota error:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };
};

const checkUsedProductCategoryQuota = (featureName) => {
    return async (req, res, next) => {
        try {
            const merchantId = req.params.merchantId || req.body.merchantId;
            const userId = req.user?.id;
            const inputCategories = req.body.categories || [];

            if (!merchantId) {
                return res.status(400).json({ message: "merchantId tidak ditemukan di request" });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                include: [{
                    model: db.MerchantSubscriptions,
                    as: 'subscription',
                    where: { isActive: true },
                    include: [{
                        model: db.MerchantPackages,
                        as: 'package',
                        include: [{
                            model: db.MerchantFeatures,
                            as: 'features',
                            through: {
                                model: db.PackageFeatures,
                                attributes: ['defaultLimit'],
                                as: 'packages'
                            }
                        }]
                    }]
                }]
            });

            if (!merchant || !merchant.subscription?.package) {
                return res.status(403).json({ message: "Paket langganan tidak aktif atau Merchant tidak ditemukan" });
            }

            const matchedFeature = merchant.subscription.package.features?.find(f => f.name === featureName);
            if (!matchedFeature) {
                return res.status(403).json({ message: `Fitur "${featureName}" tidak tersedia di paket kamu` });
            }

            const limit = matchedFeature.packages?.defaultLimit;
            if (limit === null || limit === "unlimited") return next();

            // const [existing] = await db.sequelize.query(
            //     `
            //     SELECT DISTINCT mpc.categoryId
            //     FROM \`MerchantProductCategories\` mpc
            //     JOIN \`MerchantProducts\` mp ON mp.id = mpc.\`merchantProductId\`
            //     WHERE mp.\`merchantId\` = :merchantId
            //   `,
            //     {
            //         replacements: { merchantId },
            //         type: db.Sequelize.QueryTypes.SELECT
            //     }
            // );

            const existing = await db.sequelize.query(
                `
                SELECT DISTINCT mpc.categoryId
                FROM \`MerchantProductCategories\` mpc
                JOIN \`MerchantProducts\` mp ON mp.id = mpc.\`merchantProductId\`
                WHERE mp.\`merchantId\` = :merchantId
                `,
                {
                    replacements: { merchantId },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const usedCategoryIds = new Set(existing.map(e => Number(e.categoryId)));

            const inputCategoryIds = [];

            for (const cat of inputCategories) {
                if (typeof cat === 'number') {
                    inputCategoryIds.push(cat);
                } else if (typeof cat === 'string') {
                    const [category] = await db.Categories.findOrCreate({
                        where: { name: cat.trim() },
                        defaults: { name: cat.trim() }
                    });
                    inputCategoryIds.push(category.id);
                }
            }

            const uniqueNewCategories = [
                ...new Set(inputCategoryIds.filter(catId => !usedCategoryIds.has(catId)))
            ];

            const remainingQuota = limit - usedCategoryIds.size;

            if (uniqueNewCategories.length > remainingQuota) {
                return res.status(403).json({
                    message: `Jumlah kategori produk kamu telah mencapai batas maksimal (${limit}). Kamu hanya bisa menambahkan ${remainingQuota} kategori lagi.`
                });
            }

            next();
        } catch (error) {
            console.error("checkUsedProductCategoryQuota error:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };
};



module.exports = checkUsedProductCategoryQuota;
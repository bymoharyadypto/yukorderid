const db = require('../../models');

class MerchantController {
    static async getUserMerchants(req, res) {
        try {
            const userId = req.user?.id;
            const merchantIds = req.user?.merchantIds;

            // if (!userId || !merchantIds) {
            //     return res.status(401).json({ message: "User tidak terdaftar sebagai merchant" });
            // }

            const merchants = await db.Merchants.findAll({
                where: { id: merchantIds, userId },
                attributes: ['id', 'storeName', 'storeUrl', 'isActive'],
                include: [
                    {
                        model: db.MerchantProfiles,
                        as: 'merchantProfile',
                        attributes: ['logo', 'bannerUrl', 'address', 'district', 'city', 'province', 'phone']
                    },
                    {
                        model: db.MerchantSubscriptions,
                        as: 'subscription',
                        attributes: ['id', 'startDate', 'endDate', 'isActive', 'expiredAt'],
                        include: [
                            {
                                model: db.Packages,
                                as: 'package',
                                attributes: ['id', 'name', 'price', 'durationInDays', 'description'],
                                include: [
                                    {
                                        model: db.Features,
                                        as: 'features',
                                        attributes: ['id', 'name', 'description'],
                                        through: {
                                            model: db.PackageFeatures,
                                            attributes: ['defaultLimit'],
                                            as: 'packages',
                                        },
                                    },
                                ],
                            }
                        ]

                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                message: "List merchant user berhasil diambil",
                data: merchants
            });
        } catch (err) {
            console.error("Error fetching user merchants:", err);
            return res.status(500).json({ message: "Gagal mengambil data merchant", error: err.message });
        }
    }

    static async getUserMerchant(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId },
                attributes: ['id', 'storeName', 'storeUrl', 'isActive'],
                include: [
                    {
                        model: db.MerchantProfiles,
                        as: 'merchantProfile',
                        attributes: ['id', 'logo', 'bannerUrl', 'address', 'phone', 'district', 'city', 'province']
                    },
                    {
                        model: db.MerchantSubscriptions,
                        as: 'subscription',
                        attributes: ['id', 'startDate', 'endDate', 'isActive', 'expiredAt'],
                        include: [
                            {
                                model: db.Packages,
                                as: 'package',
                                attributes: ['id', 'name', 'price', 'durationInDays', 'description']
                            }
                        ]
                    }
                ]
            });

            if (!merchant) {
                return res.status(404).json({ message: "Merchant tidak ditemukan" });
            }

            return res.status(200).json({ data: merchant });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Gagal mengambil data merchant", error: error.message });
        }
    }


}

module.exports = MerchantController
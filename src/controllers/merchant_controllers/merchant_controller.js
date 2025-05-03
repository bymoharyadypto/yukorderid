const db = require('../../models');

class MerchantController {
    static async getUserMerchants(req, res) {
        // console.log("masuk sini");

        try {
            const userId = req.user?.id;
            const merchantIds = req.user?.merchantIds;
            // console.log(req.user);

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
                        attributes: ['id', 'subText', 'logo', 'bannerUrl', 'address', 'district', 'city', 'province', 'phone']
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

            if (!merchants || merchants.length === 0) {
                return res.status(404).json({ message: "Tidak ada merchant yang ditemukan" });
            }

            return res.status(200).json({
                success: true,
                message: "List merchant user berhasil diambil",
                data: merchants
            });
        } catch (err) {
            console.error("Error fetching user merchants:", err);
            return res.status(500).json({ success: false, message: "Gagal mengambil data merchant", error: err.message });
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
                        attributes: ['id', 'logo', "subText", 'bannerUrl', 'address', 'phone', 'district', 'city', 'province']
                    },
                    {
                        model: db.MerchantSubscriptions,
                        as: 'subscription',
                        attributes: ['id', 'startDate', 'endDate', 'isActive', 'expiredAt'],
                        include: [
                            {
                                model: db.MerchantPackages,
                                as: 'package',
                                attributes: ['id', 'name', 'price', 'durationInDays', 'description']
                            }
                        ]
                    },
                    {
                        model: db.MerchantOperatingHours,
                        as: 'operatingHours',
                        attributes: ['id', 'day', 'isOpen', 'is24Hours'],
                        order: [['id', 'ASC']],
                        include:
                        {
                            model: db.MerchantOperatingHourSlots,
                            attributes: ["id", "openTime", "closeTime"],
                            as: 'slots',

                        }

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
    static async updateMerchantWithOperatingHours(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const merchantId = req.params.merchantId;
            const {
                storeName,
                storeUrl,
                subText,
                phone,
                address,
                operatingHours,
            } = req.body;

            const merchant = await db.Merchants.findOne({ where: { id: merchantId }, transaction });
            if (!merchant) {
                return res.status(404).json({ message: "Merchant tidak ditemukan" });
            }

            await db.Merchants.update(
                { storeName, storeUrl },
                { where: { id: merchantId }, transaction }
            );

            await db.MerchantProfiles.update(
                { subText, phone, address },
                { where: { merchantId }, transaction }
            );

            const existingHours = await db.MerchantOperatingHours.findAll({ where: { merchantId }, transaction });
            const hourIds = existingHours.map(hour => hour.id);
            await db.MerchantOperatingHourSlots.destroy({ where: { merchantOperatingHourId: hourIds }, transaction });
            await db.MerchantOperatingHours.destroy({ where: { merchantId }, transaction });

            for (const hour of operatingHours) {
                const { day, isOpen, is24Hours, openTime, closeTime } = hour;

                const createdHour = await db.MerchantOperatingHours.create({
                    merchantId,
                    day,
                    isOpen,
                    is24Hours,
                }, { transaction });

                // Jika bukan 24 jam, tambahkan slot
                if (!is24Hours && isOpen) {
                    await db.MerchantOperatingHourSlots.create({
                        merchantOperatingHourId: createdHour.id,
                        openTime,
                        closeTime,
                    }, { transaction });
                }
            }

            await transaction.commit();
            return res.json({ success: true, message: 'Merchant dan jam operasional berhasil diperbarui' });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui data merchant' });
        }
    }

}

module.exports = MerchantController
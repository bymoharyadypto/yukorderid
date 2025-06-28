
const db = require('../../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
class MerchantManageController {

    static async getMerchantListWithPagination(req, res) {
        try {
            const {
                currentPage = 1,
                perPage = 10,
                orderBy = 'createdAt',
                orderDirection = 'DESC',
                search = ''
            } = req.query;

            const offset = (parseInt(currentPage) - 1) * parseInt(perPage);
            const limit = parseInt(perPage);

            const whereClause = search
                ? {
                    [Op.or]: [
                        { '$user.name$': { [Op.like]: `%${search}%` } },
                        { '$user.phoneNumber$': { [Op.like]: `%${search}%` } },
                        { name: { [Op.like]: `%${search}%` } }
                    ]
                }
                : {};

            const { count, rows } = await db.Merchants.findAndCountAll({
                where: whereClause,
                distict: true,
                include: [
                    {
                        model: db.Users,
                        as: 'user',
                        attributes: ['id', 'name', 'phoneNumber']
                    },
                    {
                        model: db.MerchantSubscriptions,
                        as: 'subscription',
                        attributes: ['id', 'merchantId', 'orderId', 'packageId', 'startDate', 'endDate', 'isActive', 'expiredAt'],
                        include: [
                            {
                                model: db.MerchantPackages,
                                as: 'package',
                                attributes: ['id', 'name', 'price', 'durationInDays', 'description']
                            }
                        ]
                    }
                ],
                order: [[orderBy, orderDirection]],
                offset,
                limit
            });

            const formatted = rows.map((merchant) => ({
                id: merchant.id,
                merchantName: merchant.name,
                plan: merchant.package?.name || 'Free',
                planExpiredAt: merchant.planExpiredAt,
                createdAt: merchant.createdAt,
                username: merchant.user?.name,
                phoneNumber: merchant.user?.phoneNumber
            }));

            return res.status(200).json({
                pagination: {
                    currentPage: parseInt(currentPage),
                    perPage: parseInt(perPage),
                    totalPages: Math.ceil(count / perPage),
                    totalData: count
                },
                data: formatted
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getMerchantDetail(req, res) {
        try {
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId },
                include: [
                    {
                        model: db.Users,
                        as: 'user',
                        attributes: ['id', 'name', 'phoneNumber', 'email']
                    },
                    {
                        model: db.MerchantSubscriptions,
                        as: 'subscription',
                        attributes: ['id', 'merchantId', 'orderId', 'packageId', 'startDate', 'endDate', 'isActive', 'expiredAt'],
                        include: [
                            {
                                model: db.MerchantPackages,
                                as: 'package',
                                attributes: ['id', 'name', 'price', 'durationInDays', 'description']
                            }
                        ]
                    }
                ]
            });

            if (!merchant) {
                return res.status(404).json({ message: 'Merchant tidak ditemukan atau Tidak aktif' });
            }

            return res.status(200).json({
                data: {
                    id: merchant.id,
                    name: merchant.name,
                    plan: merchant.subscription?.package?.name || 'Free',
                    planExpiredAt: merchant.planExpiredAt,
                    createdAt: merchant.createdAt,
                    username: merchant.user?.name,
                    phoneNumber: merchant.user?.phoneNumber,
                    email: merchant.user?.email
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async changeMerchantSubscription(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { merchantId } = req.params;
            const { packageId } = req.body;

            const merchant = await db.Merchants.findByPk(merchantId, { transaction });

            if (!merchant) {
                return res.status(404).json({ message: 'Merchant Tidak Ditemukan atau Tidak Aktif' });
            }

            const merchantPackage = await db.MerchantPackages.findOne({ where: { id: packageId }, transaction });

            if (!merchantPackage) {
                return res.status(404).json({ message: 'Package not found' });
            }

            await db.MerchantSubscriptions.update({ packageId }, { where: { merchantId }, transaction });

            await transaction.commit();

            return res.status(200).json({
                message: 'Plan updated successfully',
                data: {
                    id: merchant.id,
                    name: merchant.name,
                    plan: merchantPackage.name,
                }
            });
        } catch (error) {
            console.error(error);
            await transaction.rollback();
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async changeMerchantSubscriptionExpiredAt(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { merchantId } = req.params;
            const { expiredAt } = req.body;

            const merchant = await db.Merchants.findByPk(merchantId, { transaction });

            if (!merchant) {
                return res.status(404).json({ message: 'Merchant tidak ditemukan atau Tidak aktif' });
            }

            const formattedExpiredAt = dayjs(expiredAt).isValid() ? dayjs(expiredAt).toDate() : null;

            await db.MerchantSubscriptions.update({ expiredAt: formattedExpiredAt }, { where: { merchantId }, transaction });
            await transaction.commit();
            return res.status(200).json({
                message: 'Berhasil mengubah tanggal kedaluwarsa langganan',
                data: {
                    id: merchant.id,
                    name: merchant.name,
                    expiredAt
                }
            });
        } catch (error) {
            console.error(error);
            await transaction.rollback();
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}


module.exports = MerchantManageController;
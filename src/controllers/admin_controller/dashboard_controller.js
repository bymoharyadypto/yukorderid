const db = require('../../models');
const { Op } = require('sequelize');

class DashboardController {
    static async getAdminDashboardSummary(req, res) {
        try {
            const totalIncomeResult = await db.Payments.findAll({
                attributes: [
                    [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'totalIncome']
                ],
                where: {
                    status: 'PAID'
                },
                raw: true
            });
            const totalIncome = parseInt(totalIncomeResult[0].totalIncome) || 0;

            const totalCustomer = await db.Users.count({
                where: {
                    roleId: 2,
                }
            });

            const totalMerchant = await db.Merchants.count({
                where: {
                    isActive: true
                }
            });

            const totalProduct = await db.MerchantProducts.count();

            return res.status(200).json({
                message: 'Dashboard summary',
                data: {
                    totalIncome,
                    totalCustomer,
                    totalMerchant,
                    totalProduct
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(error.status || 500).send({ message: error.message || 'Internal server error' });
        }
    }

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
                    totalData: count,
                    totalPages: Math.ceil(count / perPage)
                },
                data: formatted
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = DashboardController;
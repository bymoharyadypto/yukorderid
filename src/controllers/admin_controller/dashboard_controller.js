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
}

module.exports = DashboardController;
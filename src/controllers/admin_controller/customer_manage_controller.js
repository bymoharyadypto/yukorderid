const db = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

class CustomerManageController {
    static async getCustomerListWithPagination(req, res) {
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
                        { name: { [Op.like]: `%${search}%` } },
                        { phoneNumber: { [Op.like]: `%${search}%` } }
                    ]
                }
                : {};

            const { count, rows } = await db.Users.findAndCountAll({
                where: { ...whereClause, roleId: 2 },
                attributes: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    email: true,
                    createdAt: true,
                    include: [
                        [
                            literal(`(
                            SELECT COALESCE(SUM(o.totalAmount), 0)
                            FROM Orders AS o
                            WHERE o.userId = Users.id AND o.status = 'Delivered'
                        )`),
                            'totalTransaction'
                        ]
                    ]
                },
                order: [[orderBy, orderDirection]],
                offset,
                limit
            });

            const formatted = rows.map((customer) => ({
                id: customer.id,
                name: customer.name,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                createdAt: customer.createdAt,
                totalTransaction: customer.getDataValue('totalTransaction') || 0
            }));

            return res.status(200).json({
                message: 'Customer list retrieved successfully',
                data: {
                    totalCustomers: count,
                    customers: formatted,
                    currentPage: parseInt(currentPage),
                    perPage: parseInt(perPage)
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(error.status || 500).send({ message: error.message || 'Internal server error' });
        }
    }
}

module.exports = CustomerManageController;
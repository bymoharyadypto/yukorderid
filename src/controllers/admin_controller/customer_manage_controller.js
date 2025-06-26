const db = require('../../models');

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
                order: [[orderBy, orderDirection]],
                offset,
                limit
            });

            const formatted = rows.map((customer) => ({
                id: customer.id,
                name: customer.name,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                createdAt: customer.createdAt
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
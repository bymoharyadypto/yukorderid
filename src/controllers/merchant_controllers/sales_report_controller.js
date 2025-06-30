const db = require("../../models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

class SalesReportController {

    static async getSalesReport(req, res) {
        try {
            const { merchantId } = req.params;

            if (!merchantId) {
                return res.status(400).json({ message: "merchantId wajib diisi" });
            }

            const today = new Date();
            const dates = [];
            for (let i = 4; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                dates.push(d.toISOString().split("T")[0]);
            }

            const orders = await db.Orders.findAll({
                where: {
                    paymentStatus: "Paid",
                    createdAt: {
                        [Op.between]: [
                            new Date(dates[0] + " 00:00:00"),
                            new Date(dates[dates.length - 1] + " 23:59:59"),
                        ],
                    },
                },
                include: [
                    {
                        model: db.OrderItems,
                        as: "orderItems",
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: "product",
                                where: { merchantId: merchantId },
                                attributes: [],
                            },
                        ],
                    },
                ],
            });

            const report = {};
            dates.forEach((date, idx) => {
                report[date] = {
                    label: idx === 4 ? "Hari ini" : `${4 - idx} hari lalu`,
                    netSales: 0,
                    totalOrders: 0,
                };
            });

            for (const order of orders) {
                const dateKey = order.createdAt.toISOString().split("T")[0];
                if (report[dateKey]) {
                    report[dateKey].netSales += order.totalAmount || 0;
                    report[dateKey].totalOrders += 1;
                }
            }

            const netSalesSeries = [];
            const totalOrderSeries = [];
            const labels = [];

            dates.forEach((date) => {
                const item = report[date];
                labels.push(item.label);
                netSalesSeries.push(item.netSales);
                totalOrderSeries.push(item.totalOrders);
            });

            return res.json({
                labels,
                netSales: {
                    total: netSalesSeries.reduce((a, b) => a + b, 0),
                    data: netSalesSeries,
                },
                totalOrders: {
                    total: totalOrderSeries.reduce((a, b) => a + b, 0),
                    data: totalOrderSeries,
                },
            });
        } catch (error) {
            console.error("getSalesReport error:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    static async getNetSalesOrderReport(req, res) {
        try {
            const { merchantId } = req.params;
            const { id: userId } = req.user;
            if (!merchantId) return res.status(400).json({ message: "merchantId wajib diisi" });

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }

            const today = new Date();
            const dates = [];
            for (let i = 4; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                dates.push(d.toISOString().split("T")[0]);
            }

            const orders = await db.Orders.findAll({
                where: {
                    paymentStatus: "Paid",
                    createdAt: {
                        [Op.between]: [
                            new Date(dates[0] + " 00:00:00"),
                            new Date(dates[4] + " 23:59:59"),
                        ],
                    },
                },
                include: [
                    {
                        model: db.OrderItems,
                        as: "orderItems",
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: "product",
                                where: { merchantId: merchant.id },
                                attributes: [],
                            },
                        ],
                    },
                ],
            });

            const result = {};
            dates.forEach((date, i) => {
                result[date] = {
                    label: i === 4 ? "Hari ini" : `${4 - i} hari lalu`,
                    total: 0,
                };
            });

            for (const order of orders) {
                const key = order.createdAt.toISOString().split("T")[0];
                if (result[key]) result[key].total += order.totalAmount || 0;
            }

            const data = dates.map((date) => ({
                label: result[date].label,
                value: result[date].total,
            }));

            const total = data.reduce((a, b) => a + b.value, 0);

            return res.json({ total, data });
        } catch (error) {
            console.error("getNetSalesReport error:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };

    static async getTotalOrdersReport(req, res) {
        try {
            const { merchantId } = req.params;
            const { id: userId } = req.user;

            if (!merchantId) return res.status(400).json({ message: "merchantId wajib diisi" });

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }
            const today = new Date();
            const dates = [];
            for (let i = 4; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                dates.push(d.toISOString().split("T")[0]);
            }

            const orders = await db.Orders.findAll({
                where: {
                    paymentStatus: "Paid",
                    createdAt: {
                        [Op.between]: [
                            new Date(dates[0] + " 00:00:00"),
                            new Date(dates[4] + " 23:59:59"),
                        ],
                    },
                },
                include: [
                    {
                        model: db.OrderItems,
                        as: "orderItems",
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: "product",
                                where: { merchantId: merchant.id },
                                attributes: [],
                            },
                        ],
                    },
                ],
            });

            const result = {};
            dates.forEach((date, i) => {
                result[date] = {
                    label: i === 4 ? "Hari ini" : `${4 - i} hari lalu`,
                    count: 0,
                };
            });

            for (const order of orders) {
                const key = order.createdAt.toISOString().split("T")[0];
                if (result[key]) result[key].count += 1;
            }

            const data = dates.map((date) => ({
                label: result[date].label,
                value: result[date].count,
            }));

            const total = data.reduce((a, b) => a + b.value, 0);

            return res.json({ total, data });
        } catch (error) {
            console.error("getTotalOrdersReport error:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }

}

module.exports = SalesReportController
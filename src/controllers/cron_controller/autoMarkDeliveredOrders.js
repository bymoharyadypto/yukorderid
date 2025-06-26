const { Op } = require("sequelize");
const db = require("../../models");
const dayjs = require("dayjs");

async function autoMarkDeliveredOrders() {
    console.log(`[${new Date().toISOString()}] Starting autoMarkDeliveredOrders job`);

    try {
        const orders = await db.Orders.findAll({
            where: { status: 'Shipped' },
            include: [{
                model: db.OrderShippingMethods,
                as: 'orderShippingMethods',
                required: true
            }]
        });

        for (const order of orders) {
            const shipping = order.orderShippingMethods;
            if (!shipping || !shipping.shippedAt || !shipping.etd) continue;

            const [minEtd] = shipping.etd.split('-').map(e => parseInt(e));
            if (isNaN(minEtd)) continue;

            const estimatedDeliveryDate = dayjs(shipping.shippedAt).add(minEtd + 1, 'day');

            if (dayjs().isAfter(estimatedDeliveryDate)) {
                const t = await db.sequelize.transaction();
                try {
                    await order.update({ status: 'Delivered' }, { transaction: t });
                    await shipping.update({ deliveredAt: new Date() }, { transaction: t });

                    await db.OrderStatusHistories.create({
                        orderId: order.id,
                        status: 'Delivered',
                        changeAt: new Date(),
                        notes: 'Auto-marked as Delivered by system (cron job)'
                    }, { transaction: t });

                    await t.commit();
                    console.log(`✅ Order ID ${order.id} auto-marked as Delivered`);
                } catch (err) {
                    await t.rollback();
                    console.error(`❌ Failed to auto-mark order ${order.id}:`, err);
                }
            }
        }

        console.log(`[${new Date().toISOString()}] Finished autoMarkDeliveredOrders job`);
    } catch (error) {
        console.error("❌ Error in autoMarkDeliveredOrders:", error);
    }
}

module.exports = autoMarkDeliveredOrders;

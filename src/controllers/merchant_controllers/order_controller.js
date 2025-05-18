const db = require('../../models');

class OrderController {
    static async getMerchantOrders(req, res) {
        try {
            const { merchantId } = req.params;
            const { id: userId } = req.user;

            if (!merchantId) {
                return res.status(400).json({ error: 'Merchant user ID tidak boleh kosong' });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }

            const merchantProducts = await db.MerchantProducts.findAll({
                where: { merchantId: merchant.id },
                attributes: ['id']
            });

            const merchantProductIds = merchantProducts.map(p => p.id);
            if (merchantProductIds.length === 0) {
                return res.status(200).json({ orders: [] });
            }

            const orders = await db.Orders.findAll({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: {
                    orderType: 'Order Merchant Product'
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: db.OrderItems,
                        as: 'orderItems',
                        required: true,
                        where: {
                            productId: merchantProductIds
                        },
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
                                include: [
                                    {
                                        model: db.MerchantProductVariantOptions,
                                        as: 'variantOptions',
                                        attributes: { exclude: ['value', 'createdAt', 'updatedAt'] },
                                        include: [
                                            {
                                                model: db.MerchantProductVariantOptionValues,
                                                as: 'optionValues',
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                include: [
                                                    {
                                                        model: db.MerchantProductVariants,
                                                        as: 'variant',
                                                        attributes: ['id', 'name']
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        model: db.MerchantProductImages,
                                        as: 'images',
                                        attributes: ['id', 'imageUrl']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.Payments,
                        as: 'payments',
                        include: [
                            {
                                model: db.PaymentMethods,
                                as: 'method',
                                attributes: ['id', 'name']
                            },
                            {
                                model: db.PaymentVerifications,
                                as: 'verifications'
                            }
                        ]
                    },
                    {
                        model: db.ShippingAddresses,
                        as: 'shippingAddresses'
                    },
                    {
                        model: db.OrderShippingMethods,
                        as: 'orderShippingMethods',
                        include: [
                            {
                                model: db.Merchants,
                                attributes: ['id', 'storeName'],
                                as: 'merchant'
                            }
                        ]
                    },
                    {
                        model: db.MerchantDiscounts,
                        required: false,
                        as: 'merchantDiscounts',
                        attributes: ['id', 'code', 'discountType', 'discountValue']
                    },
                    {
                        model: db.OrderStatusHistories,
                        as: 'orderStatusHistories',
                        separate: true,
                        order: [['changeAt', 'DESC']],
                        limit: 1
                    }
                ]
            });

            return res.status(200).json({ orders });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async getMerchantOrderById(req, res) {
        try {
            const { merchantId } = req.params;
            const { id: userId } = req.user;
            const { orderId } = req.params;

            if (!merchantId) {
                return res.status(400).json({ error: 'Merchant user ID tidak boleh kosong' });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan' });
            }

            const merchantProducts = await db.MerchantProducts.findAll({
                where: { merchantId: merchant.id },
                attributes: ['id']
            });

            const merchantProductIds = merchantProducts.map(p => p.id);
            if (merchantProductIds.length === 0) {
                return res.status(404).json({ error: 'Merchant tidak memiliki produk' });
            }

            const order = await db.Orders.findOne({
                where: {
                    id: orderId,
                    orderType: 'Order Merchant Product'
                },
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                include: [
                    {
                        model: db.OrderItems,
                        as: 'orderItems',
                        required: true,
                        where: {
                            productId: merchantProductIds
                        },
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
                                include: [
                                    {
                                        model: db.MerchantProductVariantOptions,
                                        as: 'variantOptions',
                                        attributes: { exclude: ['value', 'createdAt', 'updatedAt'] },
                                        include: [
                                            {
                                                model: db.MerchantProductVariantOptionValues,
                                                as: 'optionValues',
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                include: [
                                                    {
                                                        model: db.MerchantProductVariants,
                                                        as: 'variant',
                                                        attributes: ['id', 'name']
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        model: db.MerchantProductImages,
                                        as: 'images',
                                        attributes: ['id', 'imageUrl']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.Payments,
                        as: 'payments',
                        include: [
                            {
                                model: db.PaymentMethods,
                                as: 'method',
                                attributes: ['id', 'name']
                            },
                            {
                                model: db.PaymentVerifications,
                                as: 'verifications'
                            }
                        ]
                    },
                    {
                        model: db.ShippingAddresses,
                        as: 'shippingAddresses'
                    },
                    {
                        model: db.OrderShippingMethods,
                        as: 'orderShippingMethods',
                        include: [
                            {
                                model: db.Merchants,
                                attributes: ['id', 'storeName'],
                                as: 'merchant'
                            }
                        ]
                    },
                    {
                        model: db.MerchantDiscounts,
                        required: false,
                        as: 'merchantDiscounts',
                        attributes: ['id', 'code', 'discountType', 'discountValue']
                    },
                    {
                        model: db.OrderStatusHistories,
                        as: 'orderStatusHistories',
                        separate: true,
                        order: [['changeAt', 'DESC']],
                        limit: 1
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ error: 'Order tidak ditemukan atau tidak mengandung produk merchant ini' });
            }

            return res.status(200).json({ order });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async processCustomerOrderForMerchant(req, res) {
        const t = await db.sequelize.transaction();
        try {
            const merchantId = req.user.merchantIds;
            const staffId = req.user.id;
            const { orderId } = req.params;

            const order = await db.Orders.findOne({
                where: { id: orderId },
                include: [
                    {
                        model: db.OrderItems,
                        as: 'orderItems',
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: 'product',
                                where: { merchantId }
                            }
                        ]
                    },
                    {
                        model: db.Payments,
                        as: 'payments',
                        include: [{ model: db.PaymentVerifications, as: 'verifications' }]
                    }
                ],
                transaction: t,
                // lock: t.LOCK.UPDATE
            });

            if (!order) throw new Error('Order tidak ditemukan untuk merchant ini');
            const payment = order.payments;

            // if (!payment || payment.status !== 'Pending') {
            //     throw new Error('Pembayaran tidak dalam status Pending, tidak bisa diproses');
            // }
            // if (!payment || payment.status !== 'Paid') {
            //     throw new Error('Pembayaran tidak dalam status Paid, tidak bisa diproses');
            // }

            const items = order.orderItems;
            for (const item of items) {
                const product = item.product;
                const quantity = item.quantity;

                const productRow = await db.MerchantProducts.findOne({
                    where: { id: product.id },
                    transaction: t,
                    // lock: t.LOCK.UPDATE
                });

                if (!productRow || !productRow.isActive || productRow.stock < quantity) {
                    throw new Error(`Stok tidak cukup untuk produk ${productRow?.name || product.id}`);
                }

                if (item.variantOptionId) {
                    const variantOption = await db.MerchantProductVariantOptions.findOne({
                        where: { id: item.variantOptionId },
                        transaction: t,
                        // lock: t.LOCK.UPDATE
                    });

                    if (!variantOption || variantOption.stock < quantity) {
                        throw new Error(`Stok tidak cukup untuk varian produk ${productRow.name}`);
                    }

                    variantOption.stock -= quantity;
                    await variantOption.save({ transaction: t });
                }

                productRow.stock -= quantity;
                await productRow.save({ transaction: t });

                await db.OrderStatusHistories.create({
                    orderId: order.id,
                    status: 'Processing',
                    changeAt: new Date(),
                    notes: `Produk ${productRow.name} sedang diproses oleh merchant`
                }, { transaction: t });
            }

            payment.status = 'Paid';
            payment.paidAt = new Date();
            await payment.save({ transaction: t });

            const verification = payment.verifications?.[0];
            if (verification && verification.status === 'Pending') {
                verification.status = 'Accepted';
                verification.verifiedAt = new Date();
                verification.verifiedBy = staffId;
                verification.notes = 'Diverifikasi otomatis saat merchant memproses order';
                await verification.save({ transaction: t });
            }


            order.status = 'Processing';
            await order.save({ transaction: t });

            await db.OrderStatusHistories.create({
                orderId: order.id,
                status: 'Processing',
                changeAt: new Date(),
                notes: 'Order diproses oleh merchant, status pembayaran diperbarui'
            }, { transaction: t });

            await t.commit();
            return res.status(200).json({ message: 'Order berhasil diproses dan pembayaran dikonfirmasi' });
        } catch (error) {
            console.log(error);
            await t.rollback();
            return res.status(400).json({ error: error.message });
        }
    }

    static async inputOrderShipping(req, res) {
        const t = await db.sequelize.transaction();
        try {
            const merchantId = req.user.merchantId;
            const { orderId } = req.params;
            const { courierName, trackingNumber, shippedAt } = req.body;

            // if (!courierName || !serviceType || !shippingCost || !etd || !trackingNumber) {
            //     throw new Error('Semua informasi pengiriman wajib diisi');
            // }

            const shipping = await db.OrderShippingMethods.findOne({
                where: {
                    orderId,
                    merchantId
                },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!shipping) {
                throw new Error('Informasi pengiriman untuk merchant ini tidak ditemukan dalam order');
            }

            if (shipping.shippedAt) {
                throw new Error('Pengiriman sudah pernah dicatat');
            }

            // const order = await db.Orders.findOne({
            //     where: {
            //         id: orderId,
            //         status: 'Processing'
            //     },
            //     include: [{
            //         model: db.OrderItems,
            //         as: 'orderItems',
            //         include: {
            //             model: db.MerchantProducts,
            //             as: 'product',
            //             where: { merchantId }
            //         }
            //     }],
            //     transaction: t,
            //     lock: t.LOCK.UPDATE
            // });

            // if (!order) {
            //     throw new Error('Order tidak ditemukan atau belum siap untuk dikirim');
            // }

            // if (order.orderItems.length === 0) {
            //     throw new Error('Order ini tidak memiliki produk dari merchant Anda');
            // }

            const orderItems = await db.OrderItems.findAll({
                where: { orderId },
                include: [{
                    model: db.MerchantProducts,
                    as: 'product',
                    where: { merchantId }
                }],
                transaction: t
            });

            if (orderItems.length === 0) {
                throw new Error('Order ini tidak memiliki produk dari merchant Anda');
            }

            // const existingShipping = await db.OrderShippingMethods.findOne({
            //     where: { orderId },
            //     transaction: t
            // });
            // if (existingShipping) {
            //     throw new Error('Informasi pengiriman sudah pernah diinput');
            // }

            // await db.OrderShippingMethods.create({
            //     orderId,
            //     courierName,
            //     serviceType,
            //     shippingCost,
            //     etd,
            //     trackingNumber,
            //     shippedAt: new Date()
            // }, { transaction: t });

            // order.status = 'Shipped';
            // await order.save({ transaction: t });

            // await db.OrderStatusHistories.create({
            //     orderId,
            //     status: 'Shipped',
            //     changeAt: new Date(),
            //     notes: `Dikirim via ${courierName} - ${serviceType}, Resi: ${trackingNumber}`
            // }, { transaction: t });

            await shipping.update({
                courierName,
                // serviceType,
                // etd,
                trackingNumber,
                shippedAt
            }, { transaction: t });

            await db.OrderStatusHistories.create({
                orderId,
                status: 'Shipped',
                changeAt: new Date(),
                notes: `Dikirim Tanggal ${shippedAt}, oleh merchant ${merchantId} via ${courierName} - ${shipping.serviceType}, Resi: ${trackingNumber}`
            }, { transaction: t });

            const allShipping = await db.OrderShippingMethods.findAll({
                where: { orderId },
                transaction: t
            });

            const allShipped = allShipping.every(s => s.shippedAt !== null);
            const someShipped = allShipping.some(s => s.shippedAt !== null);

            const order = await db.Orders.findByPk(orderId, { transaction: t });

            if (allShipped) {
                order.status = 'Shipped';
            } else if (someShipped) {
                order.status = 'Partially Shipped';
            }

            await order.save({ transaction: t });

            await t.commit();
            return res.status(200).json({ message: 'Pengiriman berhasil dicatat dan status order diperbarui' });
        } catch (error) {
            await t.rollback();
            return res.status(400).json({ error: error.message });
        }
    }

}
module.exports = OrderController
const db = require('../../models')
const { getShippingRateByLocation } = require('../../utils/utils');
const { Op } = require('sequelize');
class OrderController {

    static async getMerchantDiscounts(req, res) {
        try {
            const subdomain = req.params.subdomain;
            const merchant = await db.Merchants.findOne({
                where: { subdomain, isActive: true }
            });

            if (!merchant) {
                return res.status(404).json({ message: 'Toko tidak ditemukan.' });
            }

            const merchantId = merchant.id;

            const discounts = await db.MerchantDiscounts.findAll({
                attributes: ["id", "code", "description", "discountType", "discountValue", "budgetPerTransaction", "quota", "startDate", "endDate", "isActive"],
                where: { merchantId },
                include: [
                    {
                        model: db.MerchantProducts,
                        as: 'products',
                        attributes: ['id', 'name', 'price', 'stock', 'isActive'],
                        through: { attributes: [] },
                        where: {
                            isActive: true,
                            deletedAt: null
                        },
                        required: false
                    },
                    {
                        model: db.PaymentMethods,
                        as: 'paymentMethods',
                        attributes: ['id', 'name', 'type', 'provider'],
                        through: { attributes: [] }
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ],
            });

            if (!discounts || discounts.length === 0) {
                return res.status(404).json({ message: 'Tidak ada diskon yang ditemukan untuk merchant ini' });
            }

            return res.status(200).json({ data: discounts });
        } catch (err) {
            console.log('Error fetching discounts:', err);
            console.error(err);
            return res.status(500).json({ message: 'Gagal mengambil data diskon', error: err.message });
        }
    }
    static async previewOrder(req, res) {
        try {
            const userId = req.user.id;
            const { items, voucherCode, paymentMethodId } = req.body;
            const subdomain = req.params.subdomain;
            const now = new Date();

            const merchant = await db.Merchants.findOne({
                where: { subdomain, isActive: true }
            });

            if (!merchant) {
                throw new Error('Merchant tidak ditemukan');
            }
            if (!Array.isArray(items) || items.length === 0) {
                throw new Error('Item order tidak boleh kosong');
            }

            let subtotal = 0;
            const itemDetails = [];
            const productsMap = {};

            for (const item of items) {
                const product = await db.MerchantProducts.findOne({
                    attributes: ["id", "name", "price", "stock", "isActive", "crossedPrice"],
                    where: {
                        id: item.productId,
                        merchantId: merchant.id,
                        isActive: true,
                        deletedAt: null
                    }
                });

                if (!product) {
                    throw new Error(`Produk tidak tersedia: ${item.productId}`);
                }
                // console.log(product);

                productsMap[item.productId] = product;

                let price = product.price;
                let crossedPrice = product.crossedPrice;
                let variantStock = product.stock;

                if (item.variantOptionId) {
                    const variantOption = await db.MerchantProductVariantOptions.findOne({
                        attributes: ['id', 'price', 'crossedPrice', 'stock', 'isActive'],
                        where: {
                            id: item.variantOptionId,
                            merchantProductId: item.productId
                        },
                        include: [{
                            model: db.MerchantProductVariantOptionValues,
                            as: 'optionValues',
                            attributes: ['id', 'value'],
                            include: [{
                                model: db.MerchantProductVariants,
                                as: 'variant',
                                attributes: ['id', 'name']
                            }]
                        }]
                    });

                    if (!variantOption) {
                        throw new Error(`Varian tidak ditemukan untuk produk ${product.name}`);
                    }

                    price = variantOption.price ?? product.price;
                    crossedPrice = variantOption.crossedPrice ?? product.crossedPrice;
                    variantStock = variantOption.stock;

                    if (variantStock < item.quantity) {
                        const label = variantOption.optionValues.map(ov =>
                            `${ov.variant?.name}: ${ov.value}`
                        ).join(', ');
                        throw new Error(`Stok tidak cukup untuk varian ${label} dari ${product.name}`);
                    }
                } else {
                    if (product.stock < item.quantity) {
                        throw new Error(`Stok tidak cukup untuk produk ${product.name}`);
                    }
                }

                const effectivePrice = crossedPrice !== null && crossedPrice !== undefined && crossedPrice ? crossedPrice : price;
                const total = effectivePrice * item.quantity;
                subtotal += total;

                itemDetails.push({
                    productId: item.productId,
                    variantOptionId: item.variantOptionId || null,
                    quantity: item.quantity,
                    price,
                    total,
                    isPreOrder: product.isPreOrder
                });
            }

            let discountAmount = 0;

            if (voucherCode) {
                const discount = await db.MerchantDiscounts.findOne({
                    attributes: ["id", "code", "description", "discountType", "discountValue", "budgetPerTransaction", "quota", "startDate", "endDate", "isActive"],
                    where: {
                        code: voucherCode,
                        isActive: true,
                        merchantId: merchant.id,
                        [Op.and]: [
                            { startDate: { [Op.lte]: now } },
                            {
                                [Op.or]: [
                                    { endDate: null },
                                    { endDate: { [Op.gte]: now } }
                                ]
                            }
                        ]
                    },
                    include: [
                        {
                            model: db.MerchantProducts,
                            as: 'products',
                            through: { attributes: [] },
                            required: false
                        },
                        {
                            model: db.PaymentMethods,
                            as: 'paymentMethods',
                            through: { attributes: [] }
                        }
                    ]
                });

                if (!discount) {
                    throw new Error('Voucher tidak ditemukan atau tidak aktif');
                }

                if (!discount.isAllPayments) {
                    const allowedPaymentMethodIds = discount.paymentMethods.map(pm => pm.id);
                    if (!allowedPaymentMethodIds.includes(paymentMethodId)) {
                        throw new Error('Voucher tidak berlaku untuk metode pembayaran yang dipilih');
                    }
                }

                const appliesToAll = discount.isAllProducts;
                const applicableProducts = discount.products.map(p => p.id);

                for (const item of itemDetails) {
                    const isApplicable = appliesToAll || applicableProducts.includes(item.productId);
                    if (isApplicable) {
                        const rawDiscountValue = discount.discountType === 'percentage'
                            ? item.total * (discount.discountValue / 100)
                            : discount.discountValue;

                        const finalDiscount = Math.min(rawDiscountValue, discount.budgetPerTransaction || rawDiscountValue);
                        discountAmount += finalDiscount;
                    }
                }

                // merchantDiscountId = discount.id;
            }

            const address = await db.CustomerAddresses.findOne({
                where: { userId, isPrimary: true }
            });

            if (!address) {
                throw new Error('Alamat utama tidak ditemukan');
            }

            const shippingRate = await getShippingRateByLocation(merchant.id, address.city, address.province);
            if (!shippingRate) {
                throw new Error('Ongkos kirim tidak ditemukan');
            }

            const shippingTotal = shippingRate.baseCost;

            const totalAmount = subtotal - discountAmount + shippingTotal;

            return res.status(200).json({
                preview: {
                    subtotal,
                    discountAmount,
                    shippingTotal,
                    totalAmount,
                    shippingDetails: {
                        [merchant.id]: {
                            courierName: shippingRate.courierName,
                            serviceType: shippingRate.serviceType,
                            shippingCost: shippingRate.baseCost,
                            etd: shippingRate.etd
                        }
                    },
                    items: itemDetails
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    static async createOrder(req, res) {
        const t = await db.sequelize.transaction();
        try {
            const userId = req.user.id;
            const {
                items,
                voucherCode,
                note,
                paymentMethodId,
                transferProofUrl
            } = req.body;

            const subdomain = req.params.subdomain;
            const merchant = await db.Merchants.findOne({
                where: { subdomain, isActive: true }
            });

            if (!merchant) {
                throw new Error('Toko tidak ditemukan');
            }

            if (!Array.isArray(items) || items.length === 0) {
                throw new Error('Item order tidak boleh kosong');
            }

            let subtotal = 0;
            const itemDetails = [];
            const productsMap = {};

            // for (const item of items) {
            //     const product = await db.MerchantProducts.findByPk(item.productId);

            //     if (!product || !product.isActive || product.stock < item.quantity) {
            //         throw new Error(`Produk tidak tersedia atau stok tidak cukup: ${product?.name || item.productId}`);
            //     }

            //     productsMap[item.productId] = product;

            //     let price = product.price;
            //     let variantStock = product.stock;

            //     if (item.variantOptionId) {
            //         const variantOption = await db.MerchantProductVariantOptions.findOne({
            //             where: {
            //                 id: item.variantOptionId
            //             },
            //             include: [
            //                 {
            //                     model: db.MerchantProductVariantOptionValues,
            //                     as: 'optionValues',
            //                     attributes: ['id', 'value'],
            //                     include: [
            //                         {
            //                             model: db.MerchantProductVariants,
            //                             as: 'variant',
            //                             attributes: ['id', 'name']
            //                         }
            //                     ]
            //                 }
            //             ]
            //         });

            //         if (!variantOption) {
            //             throw new Error(`Opsi varian tidak ditemukan untuk produk ${product.name}`);
            //         }

            //         price = variantOption.price || product.price;
            //         variantStock = variantOption.stock;

            //         if (variantStock < item.quantity) {
            //             const variantLabels = variantOption.optionValues.map(ov =>
            //                 `${ov.variant?.name}: ${ov.value}`
            //             ).join(', ');

            //             throw new Error(`Stok tidak cukup untuk varian ${variantLabels} dari ${product.name}`);
            //         }
            //     } else {
            //         if (product.stock < item.quantity) {
            //             throw new Error(`Stok tidak cukup untuk produk ${product.name}`);
            //         }
            //     }

            //     // const total = product.price * item.quantity;
            //     // subtotal += total;
            //     const effectivePrice = price || product.price;
            //     const total = effectivePrice * item.quantity;
            //     subtotal += total;

            //     itemDetails.push({
            //         productId: item.productId,
            //         variantOptionId: item.variantOptionId || null,
            //         quantity: item.quantity,
            //         price: price,
            //         total,
            //         merchantDiscountId: null,
            //         isPreOrder: product.isPreOrder
            //     });
            // }
            for (const item of items) {
                const product = await db.MerchantProducts.findOne({
                    attributes: ["id", "name", "price", "crossedPrice", "stock", "isPreOrder", "isActive"],
                    where: {
                        id: item.productId,
                        merchantId: merchant.id,
                        isActive: true,
                        deletedAt: null
                    }
                });

                if (!product || !product.isActive) {
                    throw new Error(`Produk tidak tersedia: ${product?.name || item.productId}`);
                }

                productsMap[item.productId] = product;

                let price = product.price;
                let crossedPrice = product.crossedPrice;
                let variantStock = product.stock;

                if (item.variantOptionId) {
                    const variantOption = await db.MerchantProductVariantOptions.findOne({
                        attributes: ['id', 'price', 'crossedPrice', 'stock'],
                        where: {
                            id: item.variantOptionId,
                            merchantProductId: item.productId
                        },
                        include: [
                            {
                                model: db.MerchantProductVariantOptionValues,
                                as: 'optionValues',
                                attributes: ['id', 'value'],
                                include: [
                                    {
                                        model: db.MerchantProductVariants,
                                        as: 'variant',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    });

                    if (!variantOption) {
                        throw new Error(`Opsi varian tidak ditemukan untuk produk ${product.name}`);
                    }

                    price = variantOption.price ?? product.price;
                    crossedPrice = variantOption.crossedPrice ?? product.crossedPrice;
                    variantStock = variantOption.stock;

                    if (variantStock < item.quantity) {
                        const variantLabels = variantOption.optionValues.map(ov =>
                            `${ov.variant?.name}: ${ov.value}`
                        ).join(', ');

                        throw new Error(`Stok tidak cukup untuk varian ${variantLabels} dari ${product.name}`);
                    }
                } else {
                    if (product.stock < item.quantity) {
                        throw new Error(`Stok tidak cukup untuk produk ${product.name}`);
                    }
                }

                // const effectivePrice = price;
                const effectivePrice = crossedPrice !== null && crossedPrice !== undefined ? crossedPrice : price;
                const total = effectivePrice * item.quantity;
                subtotal += total;

                itemDetails.push({
                    productId: item.productId,
                    variantOptionId: item.variantOptionId || null,
                    quantity: item.quantity,
                    price: price,
                    total,
                    merchantDiscountId: null,
                    isPreOrder: product.isPreOrder
                });
            }


            let discountAmount = 0;
            let merchantDiscountId = null;

            let shippingFees = {};
            let shippingTotal = 0;

            const address = await db.CustomerAddresses.findOne({
                where: { userId, isPrimary: true }
            });
            if (!address) {
                throw new Error('Alamat tidak ditemukan');
            }

            for (const item of itemDetails) {
                const product = productsMap[item.productId];
                const merchantId = product.merchantId;

                if (!shippingFees[merchantId]) {
                    const rate = await getShippingRateByLocation(merchant.id, address.city, address.province);

                    if (!rate) {
                        throw new Error(`Ongkos kirim tidak ditemukan untuk merchant ID ${merchantId}`);
                    }

                    shippingFees[merchantId] = {
                        courierName: rate.courierName,
                        serviceType: rate.serviceType,
                        shippingCost: rate.baseCost,
                        etd: rate.etd
                    };

                    shippingTotal += rate.baseCost;
                }
            }

            // if (voucherCode) {
            //     const discount = await db.MerchantDiscounts.findOne({
            //         where: {
            //             code: voucherCode,
            //             isActive: true,
            //             startDate: { [Op.lte]: new Date() },
            //             endDate: { [Op.gte]: new Date() }
            //         },
            //         // include: voucherCode ? [{ model: db.MerchantDiscountProducts, as: 'product' }] : []
            //         include: [
            //             {
            //                 model: db.MerchantProducts,
            //                 as: 'products',
            //                 through: { attributes: [] }
            //             }
            //         ]
            //     });

            //     if (!discount) throw new Error('Voucher tidak ditemukan atau tidak aktif');

            //     const appliesToAll = discount.isAllProducts;
            //     // const applicableProducts = discount.MerchantDiscountProducts.map(p => p.merchantProductId);
            //     const applicableProducts = discount.products.map(p => p.id);

            //     for (const item of itemDetails) {
            //         const isApplicable = appliesToAll || applicableProducts.includes(item.productId);
            //         if (isApplicable) {
            //             const discValue = discount.discountType === 'percentage'
            //                 ? item.total * (discount.discountValue / 100)
            //                 : discount.discountValue;

            //             const finalDiscount = Math.min(discValue, discount.budgetPerTransaction || discValue);
            //             discountAmount += finalDiscount;
            //             item.merchantDiscountId = discount.id;
            //         }
            //     }

            //     merchantDiscountId = discount.id;
            // }
            if (voucherCode) {
                const discount = await db.MerchantDiscounts.findOne({
                    attributes: ["id", "code", "description", "discountType", "discountValue", "budgetPerTransaction", "quota", "startDate", "endDate", "isActive"],
                    where: {
                        merchantId: merchant.id,
                        code: voucherCode,
                        isActive: true,
                        startDate: { [Op.lte]: new Date() },
                        endDate: { [Op.gte]: new Date() }
                    },
                    include: [
                        {
                            model: db.MerchantProducts,
                            as: 'products',
                            through: { attributes: [] }
                        },
                        {
                            model: db.PaymentMethods,
                            as: 'paymentMethods',
                            through: { attributes: [] }
                        }
                    ]
                });

                if (!discount) {
                    throw new Error('Voucher tidak ditemukan atau tidak aktif');
                }

                if (!discount.isAllPayments) {
                    const allowedPaymentMethodIds = discount.paymentMethods.map(pm => pm.id);
                    if (!allowedPaymentMethodIds.includes(paymentMethodId)) {
                        throw new Error('Voucher tidak berlaku untuk metode pembayaran yang dipilih');
                    }
                }

                const appliesToAll = discount.isAllProducts;
                const applicableProducts = discount.products.map(p => p.id);

                for (const item of itemDetails) {
                    const isApplicable = appliesToAll || applicableProducts.includes(item.productId);
                    if (isApplicable) {
                        const rawDiscountValue = discount.discountType === 'percentage'
                            ? item.total * (discount.discountValue / 100)
                            : discount.discountValue;

                        const finalDiscount = Math.min(rawDiscountValue, discount.budgetPerTransaction || rawDiscountValue);
                        discountAmount += finalDiscount;
                        item.merchantDiscountId = discount.id;
                    }
                }

                merchantDiscountId = discount.id;
            }


            const totalAmount = subtotal - discountAmount + shippingTotal;

            const order = await db.Orders.create({
                userId,
                subtotalAmount: subtotal,
                discountAmount,
                totalAmount,
                status: 'Pending',
                userType: 'Customer',
                orderType: 'Order Merchant Product',
                paymentStatus: 'Paid',
                merchantDiscountId,
                isDiscount: !!voucherCode,
                note
            }, { transaction: t });

            const itemsWithOrderId = itemDetails.map(i => ({ ...i, orderId: order.id }));
            await db.OrderItems.bulkCreate(itemsWithOrderId, { transaction: t });

            for (const item of itemDetails) {
                if (item.variantOptionId) {
                    const variantOption = await db.MerchantProductVariantOptions.findOne({
                        attributes: ["id", "stock"],
                        where: { id: item.variantOptionId },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });

                    if (!variantOption) {
                        throw new Error(`Varian dengan ID ${item.variantOptionId} tidak ditemukan`);
                    }

                    if (variantOption.stock < item.quantity) {
                        throw new Error(`Stok tidak cukup untuk varian ${variantOption.id}`);
                    }

                    await variantOption.update(
                        { stock: variantOption.stock - item.quantity },
                        { transaction: t }
                    );
                } else {

                    const product = await db.MerchantProducts.findOne({
                        attributes: ["id", "stock"],
                        where: { id: item.productId },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });

                    if (!product) {
                        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
                    }

                    if (product.stock < item.quantity) {
                        throw new Error(`Stok tidak cukup untuk produk ${product.name}`);
                    }

                    await product.update(
                        { stock: product.stock - item.quantity },
                        { transaction: t }
                    );
                }
            }


            for (const [merchantId, fee] of Object.entries(shippingFees)) {
                await db.OrderShippingMethods.create({
                    orderId: order.id,
                    merchantId: parseInt(merchantId, 10),
                    courierName: fee.courierName,
                    serviceType: fee.serviceType,
                    shippingCost: fee.shippingCost,
                    etd: fee.etd
                }, { transaction: t });
            }

            const selectedPaymentMethod = await db.PaymentMethods.findOne({
                attributes: ['id', 'name', 'type', 'provider'],
                where: { id: paymentMethodId, isActive: true }
            });

            if (!selectedPaymentMethod) throw new Error('Metode pembayaran tidak valid atau tidak aktif');


            const payment = await db.Payments.create({
                orderId: order.id,
                paymentMethodId: selectedPaymentMethod.id,
                paymentChannel: selectedPaymentMethod.name,
                amount: totalAmount,
                status: 'Paid',
                paidAt: new Date(),
                note: 'Transfer Manual'
            }, { transaction: t });

            if (transferProofUrl) {
                await db.PaymentVerifications.create({
                    paymentId: payment.id,
                    transferProofUrl,
                    uploadedAt: new Date(),
                    status: 'Pending'
                }, { transaction: t });
            }

            await db.OrderStatusHistories.create({
                orderId: order.id,
                status: 'Pending',
                changeAt: new Date(),
                notes: 'Order created'
            }, { transaction: t });


            await db.ShippingAddresses.create({
                orderId: order.id,
                recipientName: address.recipientName,
                phoneNumber: address.phoneNumber,
                address: address.fullAddress,
                district: address.district,
                city: address.city,
                province: address.province,
                postalCode: address.postalCode
            }, { transaction: t });

            await t.commit();
            return res.status(201).json({ message: 'Order created successfully', order });
        } catch (error) {
            console.error(error);

            await t.rollback();
            return res.status(400).json({ error: error.message });
        }
    }

    static async getCustomerOrders(req, res) {
        try {
            const userId = req.user.id;

            const orders = await db.Orders.findAll({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: {
                    userId,
                    userType: 'Customer',
                    orderType: 'Order Merchant Product'
                },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: db.OrderItems,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        as: 'orderItems',
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
                                include: [
                                    {
                                        model: db.MerchantProductVariantOptions,
                                        attributes: { exclude: ['value', 'createdAt', 'updatedAt'] },
                                        as: 'variantOptions',
                                        include: [
                                            {
                                                model: db.MerchantProductVariantOptionValues,
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                as: 'optionValues',
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
                            },

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

    static async getOrderDetails(req, res) {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.id;

            const order = await db.Orders.findOne({
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                where: {
                    id: orderId,
                    userId,
                    userType: 'Customer',
                    orderType: 'Order Merchant Product'
                },
                include: [
                    {
                        model: db.OrderItems,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        as: 'orderItems',
                        include: [
                            {
                                model: db.MerchantProducts,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
                                include: [
                                    {
                                        model: db.MerchantProductImages,
                                        as: 'images',
                                        attributes: ['id', 'imageUrl']
                                    },
                                    {
                                        model: db.MerchantProductVariantOptions,
                                        attributes: { exclude: ['value', 'createdAt', 'updatedAt'] },
                                        as: 'variantOptions',
                                        include: [
                                            {
                                                model: db.MerchantProductVariantOptionValues,
                                                attributes: { exclude: ['createdAt', 'updatedAt'] },
                                                as: 'optionValues',
                                                include: [
                                                    {
                                                        model: db.MerchantProductVariants,
                                                        as: 'variant',
                                                        attributes: ['id', 'name']
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
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

            return res.status(200).json({ order });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async confirmOrderDelivered(req, res) {
        const t = await db.sequelize.transaction();
        try {
            const userId = req.user.id;
            const orderId = req.params.orderId;

            const order = await db.Orders.findOne({
                where: {
                    id: orderId,
                    userId,
                    status: 'Shipped'
                },
                include: [{
                    model: db.OrderShippingMethods,
                    as: 'orderShippingMethods',
                    required: true
                }]
            });

            if (!order) {
                throw new Error('Order tidak ditemukan atau belum dalam status dikirim');
            }

            await order.update({ status: 'Delivered' }, { transaction: t });
            await order.OrderShippingMethod.update(
                { deliveredAt: new Date() },
                { transaction: t }
            );

            await db.OrderStatusHistories.create({
                orderId: order.id,
                status: 'Delivered',
                changeAt: new Date(),
                notes: 'Dikonfirmasi oleh customer'
            }, { transaction: t });

            await t.commit();
            return res.status(200).json({ message: 'Order dikonfirmasi telah diterima' });
        } catch (err) {
            await t.rollback();
            return res.status(400).json({ error: err.message });
        }
    }


}

module.exports = OrderController
const db = require('../../models');

class MerchantDiscountController {
    static async getPaymentMethods(req, res) {
        try {
            const { merchantId } = req.params;
            const merchantIds = req.user?.merchantIds;

            if (!merchantId || isNaN(Number(merchantId))) {
                return res.status(400).json({ message: 'Parameter merchantId tidak valid' });
            }

            const parsedMerchantId = Number(merchantId);

            if (!Array.isArray(merchantIds) || !merchantIds.includes(parsedMerchantId)) {
                return res.status(403).json({ message: 'Akses ke merchant tidak diizinkan atau merchant tidak ditemukan' });
            }

            const paymentMethods = await db.PaymentMethods.findAll({
                where: {
                    isActive: true,
                },
                attributes: ['id', 'name', 'type', 'provider'],
            });

            if (paymentMethods.length === 0) {
                return res.status(404).json({ message: 'Tidak ada metode pembayaran aktif' });
            }

            return res.status(200).json({
                message: 'Daftar metode pembayaran',
                paymentMethods,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Gagal mengambil daftar metode pembayaran' });
        }
    }
    static async createDiscount(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const {
                code,
                description,
                discountType,
                discountValue,
                budgetPerTransaction,
                quota,
                productIds,
                paymentMethodIds,
                startDate,
                endDate,
                isAllProducts,
                isAllPayments
            } = req.body;

            const { merchantId } = req.params;
            const merchantIds = req.user?.merchantIds;

            if (!merchantId || isNaN(Number(merchantId))) {
                return res.status(400).json({ message: 'Parameter merchantId tidak valid' });
            }

            const parsedMerchantId = Number(merchantId);

            if (!Array.isArray(merchantIds) || !merchantIds.includes(parsedMerchantId)) {
                return res.status(403).json({ message: 'Akses ke merchant tidak diizinkan atau merchant tidak ditemukan' });
            }

            const discount = await db.MerchantDiscounts.create({
                merchantId: parsedMerchantId,
                code,
                description,
                discountType,
                discountValue,
                budgetPerTransaction,
                quota,
                startDate,
                endDate,
                isAllProducts,
                isAllPayments,
                isActive: false
            },
                { transaction, logging: console.log }
            );

            let finalProductIds = [];
            if (isAllProducts === true) {
                const products = await db.MerchantProducts.findAll({
                    where: { merchantId: parsedMerchantId, isActive: true },
                    attributes: ['id']
                });
                finalProductIds = products.map(p => p.id);
            } else if (Array.isArray(productIds) && productIds.length) {
                finalProductIds = productIds;
            }

            if (finalProductIds.length) {
                const productDiscounts = finalProductIds.map(productId => ({
                    merchantDiscountId: discount.id,
                    merchantProductId: productId
                }));
                await db.MerchantDiscountProducts.bulkCreate(productDiscounts, { transaction });
            }

            let finalPaymentMethodIds = [];
            if (isAllPayments === true) {
                const methods = await db.PaymentMethods.findAll({
                    where: { isActive: true },
                    attributes: ['id']
                });
                finalPaymentMethodIds = methods.map(m => m.id);
            } else if (Array.isArray(paymentMethodIds) && paymentMethodIds.length) {
                finalPaymentMethodIds = paymentMethodIds;
            }

            if (finalPaymentMethodIds.length) {
                const methodDiscounts = finalPaymentMethodIds.map(paymentMethodId => ({
                    merchantDiscountId: discount.id,
                    paymentMethodId
                }));
                await db.MerchantDiscountPaymentMethods.bulkCreate(methodDiscounts, { transaction });
            }

            await transaction.commit();
            return res.status(201).json({ message: 'Diskon berhasil dibuat' });

            // const discount = await db.MerchantDiscounts.create({
            //     merchantId: parsedMerchantId,
            //     code,
            //     description,
            //     discountType,
            //     discountValue,
            //     maxBudget,
            //     quota,
            //     startDate,
            //     endDate
            // }, { transaction });

            // if (isAllProducts === false && productIds?.length) {
            //     const productDiscounts = productIds.map(productId => ({
            //         discountId: discount.id,
            //         productId
            //     }));
            //     await db.MerchantDiscountProducts.bulkCreate(productDiscounts, { transaction });
            // }

            // if (isAllPayments === false && paymentMethodIds?.length) {
            //     const methodDiscounts = paymentMethodIds.map(paymentMethodId => ({
            //         discountId: discount.id,
            //         paymentMethodId
            //     }));
            //     await db.MerchantDiscountPaymentMethods.bulkCreate(methodDiscounts, { transaction });
            // }
            // await transaction.commit();
            // return res.status(201).json({ message: 'Diskon berhasil dibuat', data: discount });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Gagal membuat diskon', error: error.message });
        }
    }

    static async getDiscounts(req, res) {
        console.log('getDiscounts called');

        try {
            // const merchantId = req.login.merchantId;
            const { merchantId } = req.params;
            // const discounts = await db.MerchantDiscounts.findAll({
            //     where: { merchantId },
            //     // logging: console.log,
            //     include: [
            //         {
            //             model: db.MerchantProducts,
            //             as: 'products',
            //             attributes: ['id', 'name', 'price'],
            //             // through: { attributes: [] }
            //         },
            //         // {
            //         //     model: db.PaymentMethods,
            //         //     as: 'paymentMethods',
            //         //     attributes: ['id', 'name', 'type', 'provider'],
            //         //     through: { attributes: [] }
            //         // }
            //     ]
            // });
            const discounts = await db.MerchantDiscounts.findAll({
                attributes: ["id", "code", "description", "discountType", "discountValue", "budgetPerTransaction", "quota", "startDate", "endDate", "isActive"],
                where: { merchantId },
                include: [
                    {
                        model: db.MerchantProducts,
                        as: 'products',
                        attributes: ['id', 'name', 'price', 'stock', 'isActive'],
                        // through: { attributes: ['merchantProductId', 'merchantDiscountId'] },
                        through: { attributes: [] },
                        where: {
                            isActive: true
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

    static async updateDiscountStatus(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { merchantId, merchantDiscountId } = req.params;
            const { isActive } = req.body;
            const merchantIds = req.user?.merchantIds;

            if (!merchantId || isNaN(Number(merchantId)) || !merchantDiscountId || isNaN(Number(merchantDiscountId))) {
                return res.status(400).json({ message: 'Parameter merchantId atau discountId tidak valid' });
            }

            const parsedMerchantId = Number(merchantId);

            if (!Array.isArray(merchantIds) || !merchantIds.includes(parsedMerchantId)) {
                return res.status(403).json({ message: 'Akses ke merchant tidak diizinkan atau merchant tidak ditemukan' });
            }

            const [updatedRows] = await db.MerchantDiscounts.update(
                { isActive },
                {
                    where: {
                        id: merchantDiscountId,
                        merchantId: parsedMerchantId,
                    },
                    transaction
                }
            );

            if (updatedRows === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Diskon tidak ditemukan atau tidak milik merchant ini' });
            }

            await transaction.commit();
            return res.status(200).json({ message: 'Status diskon berhasil diperbarui', isActive });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Gagal memperbarui status diskon', error: error.message });
        }
    }

}

module.exports = MerchantDiscountController;

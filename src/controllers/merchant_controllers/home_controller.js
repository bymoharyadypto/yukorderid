const db = require('../../models');
const { Op } = require('sequelize');
const snap = require('../../utils/midtransClient');
const dayjs = require('dayjs');
const { generateUniqueCode } = require('../../utils/utils');
class HomeController {
    static async getMerchantHomepageData(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                attributes: ['id', 'storeName', 'subdomain', 'storeUrl'],
                include: {
                    model: db.MerchantBalances,
                    as: 'balance',
                    attributes: ['balance']
                }
            });

            if (!merchant) {
                return res.status(404).json({ message: 'Merchant tidak ditemukan' });
            }

            const user = await db.Users.findOne({
                where: { id: userId },
                attributes: ['id', 'name', 'phoneNumber']
            });

            // Ambil semua order yang memiliki item produk dari merchant tersebut
            const orders = await db.Orders.findAll({
                attributes: ['id', 'status', 'paymentStatus'],
                include: {
                    model: db.OrderItems,
                    as: 'orderItems',
                    required: true,
                    attributes: [],
                    include: {
                        model: db.MerchantProducts,
                        as: 'product',
                        required: true,
                        where: { merchantId },
                        attributes: []
                    }
                }
            });

            // Inisialisasi counter
            let totalPengiriman = 0;
            let totalSelesai = 0;
            let totalDiproses = 0;
            let totalBelumBayar = 0;

            // Loop dan hitung sesuai status
            for (const order of orders) {
                if (order.status === 'Shipped') totalPengiriman++;
                else if (order.status === 'Completed') totalSelesai++;
                else if (order.status === 'Processing') totalDiproses++;
                else if (order.paymentStatus === 'Pending') totalBelumBayar++;
            }

            const homepageData = {
                user: {
                    name: user.name,
                    phoneNumber: user.phoneNumber
                },
                merchant: {
                    name: merchant.storeName,
                    url: merchant.storeUrl,
                    balance: merchant.balance?.balance ?? 0
                },
                orders: {
                    pengiriman: totalPengiriman,
                    selesai: totalSelesai,
                    diproses: totalDiproses,
                    belumBayar: totalBelumBayar
                }
            };

            return res.status(200).json({ message: 'Berhasil ambil data homepage', data: homepageData });

        } catch (err) {
            console.error('[getMerchantHomepageData]', err);
            return res.status(500).json({ message: 'Gagal mengambil data homepage merchant' });
        }
    }

    static async previewCheckoutSubscription(req, res) {
        try {
            const { packageId } = req.body;
            if (!packageId) {
                return res.status(400).json({ message: 'packageId wajib diisi' });
            }

            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const user = await db.Users.findOne({
                where: { phoneNumber: req.user.phoneNumber },
                attributes: ['id', 'name', 'email', 'phoneNumber']
            });

            if (!user) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }

            const selectedPackage = await db.MerchantPackages.findByPk(packageId, {
                attributes: ['id', 'name', 'price', 'durationInDays', 'description']
            });

            if (!selectedPackage) {
                return res.status(404).json({ message: 'Paket tidak ditemukan' });
            }

            return res.status(200).json({
                message: 'Preview data berhasil diambil',
                data: {
                    jenisMerchant: selectedPackage.name,
                    hargaLangganan: selectedPackage.price,
                    total: selectedPackage.price,
                    user: {
                        name: user.name,
                        email: user.email,
                        phone: user.phoneNumber
                    },
                    merchant: {
                        name: merchant.storeName,
                        url: merchant.storeUrl
                    }
                }
            });

        } catch (error) {
            console.error('[Preview Checkout Error]', error);
            return res.status(500).json({ message: 'Gagal mengambil data preview' });
        }
    }

    static async changeMerchantPackage(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { packageId } = req.body;
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) throw { status: 404, message: 'Merchant tidak ditemukan' };

            const selectedPackage = await db.MerchantPackages.findByPk(packageId);
            if (!selectedPackage) throw { status: 404, message: 'Paket tidak ditemukan' };

            const isFree = selectedPackage.price === 0;
            const transactionNumber = generateUniqueCode('TXN');
            const invoiceNumber = generateUniqueCode('INV');
            if (isFree) {
                const order = await db.Orders.create({
                    userId,
                    transactionNumber: transactionNumber,
                    subTotalAmount: selectedPackage.price,
                    discountAmount: 0,
                    totalAmount: selectedPackage.price,
                    status: 'Completed',
                    userType: 'Merchant',
                    orderType: 'Subscription',
                    paymentStatus: 'Paid'
                }, { transaction });

                await db.MerchantSubscriptions.update({ isActive: false }, {
                    where: { merchantId: merchant.id },
                    transaction
                });

                await db.MerchantSubscriptions.create({
                    merchantId: merchant.id,
                    orderId: order.id,
                    packageId: selectedPackage.id,
                    isActive: true,
                }, { transaction });

                await transaction.commit();
                return res.status(200).json({ message: 'Berhasil mengganti ke paket gratis' });
            }

            const existingOrder = await db.Orders.findOne({
                where: {
                    userId,
                    orderType: 'Subscription',
                    status: 'Pending',
                    paymentStatus: 'Pending'
                },
                include: [{
                    model: db.Payments,
                    as: 'payments',
                    where: {
                        status: 'Pending',
                        expiredAt: { [Op.gt]: new Date() }
                    }
                }],
                transaction
            });

            if (existingOrder) {
                const existingPayment = existingOrder.payments[0];
                await transaction.commit();
                return res.status(200).json({
                    message: 'Silakan selesaikan pembayaran sebelumnya terlebih dahulu',
                    paymentId: existingPayment.id,
                    token: existingPayment.paymentReferenceId,
                    paymentLink: existingPayment.paymentLink
                });
            }

            const order = await db.Orders.create({
                userId,
                subTotalAmount: selectedPackage.price,
                discountAmount: 0,
                totalAmount: selectedPackage.price,
                status: 'Pending',
                userType: 'Merchant',
                orderType: 'Subscription',
                paymentStatus: 'Pending'
            }, { transaction });

            await db.OrderItems.create({
                orderId: order.id,
                productId: selectedPackage.id,
                quantity: 1,
                total: selectedPackage.price
            }, { transaction });

            const parameter = {
                transaction_details: {
                    order_id: `ORDER-${order.id}-${Date.now()}`,
                    gross_amount: selectedPackage.price,
                },
                customer_details: {
                    first_name: req.user.name,
                    email: req.user.email,
                    phone: req.user.phoneNumber,
                },
                enabled_payments: ['gopay', 'bank_transfer', 'credit_card', 'shopeepay'],
                expiry: { unit: 'hour', duration: 1 }
            };

            const midtransResponse = await snap.createTransaction(parameter);

            const payment = await db.Payments.create({
                orderId: order.id,
                externalPaymentId: parameter.transaction_details.order_id,
                invoiceNumber: invoiceNumber,
                amount: selectedPackage.price,
                status: 'Pending',
                paymentReferenceId: midtransResponse.token,
                paymentLink: midtransResponse.redirect_url,
                expiredAt: dayjs().add(1, 'hour').toDate(),
                note: 'Upgrade merchant package'
            }, { transaction });

            await db.PaymentVerifications.create({
                paymentId: payment.id,
                status: 'Pending'
            }, { transaction });

            await transaction.commit();

            return res.status(201).json({
                message: 'Silakan lanjutkan pembayaran paket baru',
                paymentId: payment.id,
                token: midtransResponse.token,
                paymentLink: midtransResponse.redirect_url
            });

        } catch (err) {
            await transaction.rollback();
            console.error(err);
            return res.status(err.status || 500).json({ message: err.message || 'Gagal mengganti paket' });
        }
    }

    static async confirmMerchantSubscriptionPayment(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { paymentId, transferProofUrl, notes } = req.body;
            const userId = req.user.id;
            const { merchantId } = req.params;

            if (!paymentId || !transferProofUrl) {
                throw { status: 400, message: 'paymentId dan transferProofUrl wajib diisi' };
            }

            const payment = await db.Payments.findOne({
                where: { id: paymentId },
                include: [{ model: db.Orders, as: 'order' }],
                transaction
            });

            if (!payment || !payment.order) {
                throw { status: 404, message: 'Data pembayaran tidak ditemukan' };
            }
            // console.log(payment);

            const order = payment.order;
            // console.log(order);

            if (order.userId !== userId) {
                throw { status: 403, message: 'Akses tidak diizinkan' };
            }
            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                throw { status: 404, message: 'Merchant tidak ditemukan' };
            }

            await db.PaymentVerifications.update({
                transferProofUrl,
                notes: notes ?? null,
                uploadedAt: new Date(),
                verifiedAt: new Date(),
                status: 'Accepted'
            }, {
                where: { paymentId: payment.id },
                transaction
            });

            await db.MerchantSubscriptions.update({
                isActive: false
            }, {
                where: { merchantId: merchant.id },
                transaction
            });
            const orderItem = await db.OrderItems.findOne({
                where: { orderId: order.id },
                transaction
            });

            if (!orderItem) {
                throw { status: 404, message: 'Item order tidak ditemukan' };
            }

            const newPackageId = orderItem.productId;

            await db.MerchantSubscriptions.create({
                merchantId: merchant.id,
                orderId: order.id,
                packageId: newPackageId,
                isActive: true
            }, { transaction });

            await transaction.commit();
            return res.status(200).json({ message: 'Konfirmasi pembayaran paket berhasil, paket baru telah aktif' });

        } catch (err) {
            await transaction.rollback();
            console.error('[confirmMerchantSubscriptionPayment]', err);
            return res.status(err.status || 500).json({ message: err.message || 'Gagal konfirmasi pembayaran paket' });
        }
    }



}

module.exports = HomeController
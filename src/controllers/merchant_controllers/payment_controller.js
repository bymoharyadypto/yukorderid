const db = require('../../models');
const { createMerchantFromOrder } = require('../user_controllers/user_controller')
const snap = require('../../utils/midtransClient');
const crypto = require('crypto');
require("dotenv").config();

class PaymentController {
    static async handleMidtransCallback(req, res) {
        try {
            const transaction = await db.sequelize.transaction();
            const {
                order_id,
                transaction_status,
                payment_type,
                transaction_id,
                fraud_status,
                signature_key
            } = req.body;
            const expectedSignature = crypto.createHash('sha512')
                .update(order_id + status.gross_amount + process.env.MIDTRANS_SERVER_KEY_DEV)
                .digest('hex');

            if (expectedSignature !== signature_key) {
                return res.status(403).json({ message: 'Invalid signature key' });
            }
            const [orderId] = order_id.split('-').slice(1, 2);
            // const [_, id] = order_id.split('-');
            // const orderId = parseInt(id, 10);

            console.log('[MIDTRANS CALLBACK INCOMING]', req.body);


            const order = await db.Orders.findByPk(orderId);
            if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

            const payment = await db.Payments.findOne({ where: { orderId: order.id } });
            if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });

            const paymentMethod = await db.PaymentMethods.findOne({ where: { type: payment_type } });
            const status = await snap.transaction.status(order_id);
            console.log('status.transaction_id', status.transaction_id);
            try {
                if (payment.status === 'Paid' && order.status === 'Paid') {
                    await transaction.rollback();
                    return res.status(200).send('Already processed');
                }
                let newPaymentStatus = 'Pending';
                let newOrderStatus = 'Pending';

                if (transaction_status === 'settlement' || transaction_status === 'capture') {
                    newPaymentStatus = 'Paid';
                    newOrderStatus = 'Paid';
                } else if (transaction_status === 'expire' || transaction_status === 'cancel' || fraud_status === 'deny') {
                    newPaymentStatus = 'Failed';
                    newOrderStatus = 'Cancelled';
                }

                await payment.update({
                    paymentMethodId: paymentMethod.id,
                    status: newPaymentStatus,
                    paidAt: newPaymentStatus === 'Paid' ? new Date() : null,
                    paymentReferenceId: transaction_id,
                    paymentChannel: `Midtrans ${payment_type}`,
                    updatedAt: new Date(),
                    // callbackPayload: JSON.stringify(req.body)
                }, { transaction });

                await order.update({
                    status: newOrderStatus === 'Paid' ? 'Completed' : 'Cancelled',
                    paymentStatus: newPaymentStatus === 'Paid' ? 'Paid' : 'Failed'

                }, { transaction });

                await transaction.commit();
                return res.status(200).send('OK');
            } catch (err) {
                await transaction.rollback();
                console.error('[Midtrans Callback Error]', err);
                return res.status(500).json({ message: 'Gagal memproses callback Midtrans' });
            }

            // return res.status(200).json({ message: 'Callback processed successfully' });

        } catch (error) {
            console.error('Callback Midtrans Error:', error);
            return res.status(500).json({ message: 'Callback processing failed' });
        }
    }

    static async handleMidtransWebhook(req, res) {
        const {
            order_id,
            transaction_status,
            status_code,
            signature_key,
            gross_amount,
            transaction_id,
            payment_type,
            fraud_status,
            token
        } = req.body;

        try {
            const expectedSignature = crypto.createHash('sha512')
                .update(order_id + status_code + gross_amount + serverKey)
                .digest('hex');

            if (expectedSignature !== signature_key) {
                return res.status(403).json({ message: 'Invalid signature' });
            }

            const payment = await db.Payments.findOne({ where: { paymentReferenceId: token } });
            if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });

            const order = await db.Orders.findByPk(payment.orderId);
            if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

            const transaction = await db.sequelize.transaction();
            try {
                if (payment.status === 'Paid' && order.status === 'Paid') {
                    await transaction.rollback();
                    return res.status(200).send('Already processed');
                }
                let newPaymentStatus = 'Pending';
                let newOrderStatus = 'Pending';

                if (transaction_status === 'settlement' || transaction_status === 'capture') {
                    newPaymentStatus = 'Paid';
                    newOrderStatus = 'Paid';
                } else if (transaction_status === 'expire' || transaction_status === 'cancel' || fraud_status === 'deny') {
                    newPaymentStatus = 'Failed';
                    newOrderStatus = 'Cancelled';
                }

                await payment.update({
                    status: newPaymentStatus,
                    paidAt: newPaymentStatus === 'Paid' ? new Date() : null,
                    callbackPayload: JSON.stringify(req.body),
                    invoiceNumber: transaction_id,
                    paymentChannel: payment_type,
                    updatedAt: new Date()
                }, { transaction });

                await order.update({
                    status: newOrderStatus,
                    paymentStatus: newPaymentStatus === 'Paid' ? 'Completed' : 'Failed'
                }, { transaction });

                await transaction.commit();
                return res.status(200).send('OK');
            } catch (err) {
                await transaction.rollback();
                console.error('[Midtrans Webhook Error]', err);
                return res.status(500).json({ message: 'Gagal memproses callback Midtrans' });
            }
        } catch (err) {
            console.error('[Midtrans Signature Validation Error]', err);
            return res.status(500).send('Webhook processing failed');
        }
    }


}

module.exports = PaymentController
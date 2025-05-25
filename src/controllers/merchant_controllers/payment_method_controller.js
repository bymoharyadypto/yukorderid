const db = require('../../models');

class PaymentMethodController {
    static async getAllPaymentMethods(req, res) {
        try {
            // console.log('masuk getAllPaymentMethods');
            const paymentMethods = await db.PaymentMethods.findAll({
                attributes: ['id', 'name', 'type', 'provider'],
                where: { isActive: true },
            });
            return res.status(200).json({ success: true, message: 'Berhasil mengambil data metode pembayaran', paymentMethods });
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil data metode pembayaran',
            });
        }
    }
}



module.exports = PaymentMethodController;
const db = require('../../models')

class BankController {
    static async getBankList(req, res) {
        try {
            const banks = await db.Banks.findAll({
                where: { isActive: true },
                attributes: ['id', 'code', 'name', 'logoUrl'],
                order: [['name', 'ASC']],
            });

            return res.status(200).json({
                success: true,
                message: 'Daftar bank berhasil diambil',
                data: banks,
            });
        } catch (error) {
            console.error('Gagal mengambil daftar bank:', error);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengambil daftar bank',
                error: error.message,
            });
        }
    }

}

module.exports = BankController
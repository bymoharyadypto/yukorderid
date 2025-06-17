const db = require("../../models");

class StaffRoleController {
    static async createStaffRole(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name } = req.body;
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const newRole = await db.MerchantStaffRoles.create({
                merchantId: merchant.id,
                name,
                isActive: true,
            }, { transaction });

            await transaction.commit();

            return res.status(201).json({ message: 'Berhasil membuat role', data: newRole });
        } catch (error) {
            await transaction.rollback();
            console.error('Gagal membuat role:', error);
            return res.status(500).json({ message: 'Gagal membuat role' });
        }
    };

    static async getAllStaffRole(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const roles = await db.MerchantStaffRoles.findAll({
                where: { merchantId: merchant.id, isActive: true },
            });

            return res.status(200).json({ message: 'Berhasil mengambil semua role', data: roles });
        } catch (error) {
            console.error('Gagal mengambil semua role:', error);
            return res.status(500).json({ message: 'Gagal mengambil semua role' });
        }
    };

    static async getStaffRoleById(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId, staffRoleId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const role = await db.MerchantStaffRoles.findOne({
                where: { id: staffRoleId, merchantId: merchant.id, isActive: true },
            });

            if (!role) {
                return res.status(404).json({ message: 'Role tidak ditemukan' });
            }

            return res.status(200).json({ message: 'Berhasil mengambil role', data: role });
        } catch (error) {
            console.error('Gagal mengambil role:', error);
            return res.status(500).json({ message: 'Gagal mengambil role' });
        }
    };

    static async updateStaffRole(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name } = req.body;
            const userId = req.user?.id;
            const { merchantId, staffRoleId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const role = await db.MerchantStaffRoles.findOne({
                where: { id: staffRoleId, merchantId: merchant.id, isActive: true },
                transaction
            });

            if (!role) {
                return res.status(404).json({ message: 'Role tidak ditemukan' });
            }

            role.name = name || role.name;

            await role.save({ transaction });

            await transaction.commit();
            return res.status(200).json({ message: 'Berhasil memperbarui role', data: role });
        } catch (error) {
            await transaction.rollback();
            console.error('Gagal memperbarui role:', error);
            return res.status(500).json({ message: 'Gagal memperbarui role' });
        }
    };

    static async updateStaffRoleStatus(req, res) {
        const transaction = await db.sequelize.transaction();
        try {

            const { isActive } = req.body;
            const userId = req.user?.id;
            const { merchantId, staffRoleId } = req.params;


            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const role = await db.MerchantStaffRoles.findOne({
                where: { id: staffRoleId, merchantId: merchant.id, isActive: true },
                transaction
            });

            if (!role) {
                return res.status(404).json({ message: 'Role tidak ditemukan' });
            }

            await role.update({ isActive }, { transaction });

            await transaction.commit();

            return res.status(200).json({ message: 'Berhasil memperbarui status role', data: role });
        } catch (error) {
            await transaction.rollback();
            console.error('Gagal memperbarui status role:', error);
            return res.status(500).json({ message: 'Gagal memperbarui status role' });
        }
    }
}

module.exports = StaffRoleController;
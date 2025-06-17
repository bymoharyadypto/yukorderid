const db = require('../../models');

class StaffController {

    static async createMerchantStaff(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, phoneNumber, roleId } = req.body;
            const userId = req.user?.id;
            const { merchantId } = req.params;

            if (!name || !phoneNumber || !roleId) {
                return res.status(400).json({ message: 'Name, phoneNumber, and roleId are required' });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const role = await db.MerchantStaffRoles.findOne({
                where: { id: roleId, merchantId: merchant.id, isActive: true },
                transaction
            });

            if (!role) {
                return res.status(404).json({ message: 'Role tidak ditemukan' });
            }

            const staff = await db.MerchantStaffs.create({
                merchantId,
                name,
                phoneNumber,
                roleId,
                status: 'Active',
            }, { transaction });

            await transaction.commit();

            return res.status(201).json({ message: 'Berhasil membuat staff', data: staff });
        } catch (error) {
            await transaction.rollback();
            console.error('Gagal membuat staff:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    static async getAllStaff(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const staffs = await db.MerchantStaffs.findAll({
                where: { merchantId: merchant.id, status: 'Active' },
                include: [
                    {
                        model: db.MerchantStaffRoles,
                        as: 'role',
                        attributes: ['id', 'name'],
                    },
                ],
            });

            return res.status(200).json({ message: 'Berhasil mengambil semua staff', data: staffs });
        } catch (error) {
            console.error('Gagal mengambil semua staff:', error);
            return res.status(500).json({ message: 'Gagal mengambil semua staff' });
        }
    };

    static async getStaffById(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantId, staffId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const staff = await db.MerchantStaffs.findOne({
                where: { id: staffId, merchantId: merchant.id, status: 'Active' },
                include: [
                    {
                        model: db.MerchantStaffRoles,
                        as: 'role',
                        attributes: ['id', 'name'],
                    },
                ],
            });

            if (!staff) {
                return res.status(404).json({ message: 'Staff tidak ditemukan' });
            }

            return res.status(200).json({ message: 'Berhasil mengambil staff', data: staff });
        } catch (error) {
            console.error('Gagal mengambil staff:', error);
            return res.status(500).json({ message: 'Gagal mengambil staff' });
        }
    };

    static async updateMerchantStaff(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, phoneNumber, roleId } = req.body;
            const userId = req.user?.id;
            const { merchantId, staffId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const staff = await db.MerchantStaffs.findOne({
                where: { id: staffId, merchantId: merchant.id, status: 'Active' },
                transaction
            });

            if (!staff) {
                return res.status(404).json({ message: 'Staff tidak ditemukan' });
            }

            if (roleId) {
                const role = await db.MerchantStaffRoles.findOne({
                    where: { id: roleId, merchantId, isActive: true },
                    transaction
                });
                if (!role) {
                    return res.status(404).json({ message: 'Role tidak ditemukan' });
                }
            }

            await staff.update({ name, phoneNumber, roleId }, { transaction });

            await transaction.commit();

            return res.status(200).json({ message: 'Berhasil memperbarui staff', data: staff });
        } catch (error) {
            await transaction.rollback();
            console.error('Gagal memperbarui staff:', error);
            return res.status(500).json({ message: 'Gagal memperbarui staff' });
        }
    };

    static async updateMerchantStaffStatus(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { status } = req.body;
            const userId = req.user?.id;
            const { merchantId, staffId } = req.params;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true },
                transaction
            });

            if (!merchant) {
                return res.status(403).json({ message: 'Merchant tidak ditemukan' });
            }

            const staff = await db.MerchantStaffs.findOne({
                where: { id: staffId, merchantId: merchant.id, status: 'Active' },
                transaction
            });

            if (!staff) {
                return res.status(404).json({ message: 'Staff tidak ditemukan' });
            }

            await staff.update({ status }, { transaction });

            await transaction.commit();

            return res.status(200).json({ message: 'Berhasil memperbarui status staff', data: staff });
        } catch (error) {
            await transaction.rollback();
            console.error('Gagal memperbarui status staff:', error);
            return res.status(500).json({ message: 'Gagal memperbarui status staff' });
        }
    }
}

module.exports = StaffController
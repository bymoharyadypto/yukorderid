const db = require('../../models');
const { normalizePhone, isValidMobilePhoneNumber } = require('../../utils/otpUtils');
class ProfileController {
    static async getUserCustomerProfile(req, res) {
        try {
            const userId = req.user.id;

            const user = await db.Users.findByPk(userId, {
                attributes: ['id', 'name', 'email', 'phoneNumber', 'isVerified'],
                include: [
                    {
                        model: db.CustomerProfiles,
                        as: 'customerProfile',
                        attributes: ['image', 'birthDate', 'gender']
                    },
                    {
                        model: db.CustomerAddresses,
                        as: 'customerAddresses',
                        where: { isPrimary: true },
                        required: false,
                        attributes: ['label', 'recipientName', 'phoneNumber', 'province', 'city', 'district', 'postalCode', 'fullAddress', 'isPrimary']
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }

            return res.status(200).json({
                message: "Data profil user berhasil diambil",
                data: user
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Gagal mengambil data profil user" });
        }
    }

    static async updateUserCustomerProfile(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const userId = req.user.id;
            const {
                name,
                email,
                image,
                birthDate,
                gender,
                address,
            } = req.body;

            const user = await db.Users.findByPk(userId, {
                include: {
                    model: db.CustomerProfiles,
                    as: 'customerProfile'
                }
            });

            if (!user) {
                await transaction.rollback();
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }

            const role = await db.Roles.findOne({ where: { name: 'customer' } });
            if (!role) throw { status: 404, message: 'Role customer tidak ditemukan' };

            await user.update({ name, email, isVerified: true, roleId: role.id }, { transaction });

            if (user.customerProfile) {
                await user.customerProfile.update({ image, birthDate, gender }, { transaction });
            } else {
                await db.CustomerProfiles.create({
                    userId: user.id,
                    image,
                    birthDate,
                    gender
                }, { transaction });
            }

            if (address) {
                const existingPrimary = await db.CustomerAddresses.findOne({
                    where: { userId, isPrimary: true },
                    transaction
                });

                if (existingPrimary) {
                    await existingPrimary.update(address, { transaction });
                } else {
                    await db.CustomerAddresses.create({
                        userId,
                        ...address,
                        isPrimary: true
                    }, { transaction });
                }
            }

            await transaction.commit();

            return res.status(200).json({ message: "Profil berhasil diperbarui" });
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return res.status(500).json({ message: "Gagal memperbarui profil" });
        }
    }
    static async createCustomerAddress(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const userId = req.user.id;
            const {
                label,
                recipientName,
                phoneNumber,
                province,
                city,
                district,
                postalCode,
                fullAddress,
                isPrimary = false
            } = req.body;

            if (!label || !recipientName || !phoneNumber || !province || !city || !district || !postalCode || !fullAddress) {
                await transaction.rollback();
                return res.status(400).json({ message: "Semua field alamat wajib diisi" });
            }

            if (!isValidMobilePhoneNumber(normalizePhone(phoneNumber))) {
                await transaction.rollback();
                return res.status(400).json({ message: "Nomor telepon tidak valid" });
            }
            const normalizedPhone = await normalizePhone(phoneNumber);

            if (isPrimary) {
                await db.CustomerAddresses.update(
                    { isPrimary: false },
                    { where: { userId }, transaction }
                );
            }

            const newAddress = await db.CustomerAddresses.create({
                userId,
                label,
                recipientName,
                phoneNumber: normalizedPhone,
                province,
                city,
                district,
                postalCode,
                fullAddress,
                isPrimary
            }, { transaction });

            await transaction.commit();
            return res.status(201).json({
                message: "Alamat berhasil ditambahkan",
                data: newAddress
            });
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return res.status(500).json({ message: "Gagal menambahkan alamat" });
        }
    }

    static async getCustomerAddressList(req, res) {
        try {
            const userId = req.user.id;

            const addresses = await db.CustomerAddresses.findAll({
                where: { userId },
                attributes: [
                    'id',
                    'label',
                    'recipientName',
                    'phoneNumber',
                    'province',
                    'city',
                    'district',
                    'postalCode',
                    'fullAddress',
                    'isPrimary',
                    'createdAt',
                    'updatedAt'
                ],
                order: [
                    ['isPrimary', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json({
                message: 'Daftar alamat berhasil diambil',
                data: addresses
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Gagal mengambil daftar alamat' });
        }
    }

    static async getCustomerAddress(req, res) {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;

            const address = await db.CustomerAddresses.findOne({
                where: {
                    id: addressId,
                    userId
                },
                attributes: [
                    'id',
                    'label',
                    'recipientName',
                    'phoneNumber',
                    'province',
                    'city',
                    'district',
                    'postalCode',
                    'fullAddress',
                    'isPrimary',
                    'createdAt',
                    'updatedAt'
                ]
            });

            if (!address) {
                return res.status(404).json({ message: 'Alamat tidak ditemukan atau bukan milik Anda' });
            }

            return res.status(200).json({
                message: 'Detail alamat berhasil diambil',
                data: address
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Gagal mengambil detail alamat' });
        }
    }

    static async updateCustomerAddress(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const userId = req.user.id;
            const { addressId } = req.params;

            const address = await db.CustomerAddresses.findOne({
                where: { id: addressId, userId }
            });

            if (!address) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Alamat tidak ditemukan atau bukan milik Anda' });
            }

            const {
                label,
                recipientName,
                phoneNumber,
                province,
                city,
                district,
                postalCode,
                fullAddress
            } = req.body;

            if (!label || !recipientName || !phoneNumber || !province || !city || !district || !postalCode || !fullAddress) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Semua field wajib diisi' });
            }

            if (!isValidMobilePhoneNumber(normalizePhone(phoneNumber))) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Nomor telepon tidak valid' });
            }

            const normalizedPhone = await normalizePhone(phoneNumber);

            await address.update({
                label,
                recipientName,
                phoneNumber: normalizedPhone,
                province,
                city,
                district,
                postalCode,
                fullAddress
            }, { transaction });

            await transaction.commit();
            return res.status(200).json({
                message: 'Alamat berhasil diperbarui',
                data: address
            });
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return res.status(500).json({ message: 'Gagal memperbarui alamat' });
        }
    }
    static async updateCustomerPrimaryAddress(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const userId = req.user.id;
            const { addressId } = req.params;

            const address = await db.CustomerAddresses.findOne({
                where: { id: addressId, userId }
            });

            if (!address) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Alamat tidak ditemukan atau bukan milik Anda' });
            }

            await db.CustomerAddresses.update(
                { isPrimary: false },
                { where: { userId }, transaction }
            );

            await address.update({ isPrimary: true }, { transaction });

            await transaction.commit();
            return res.status(200).json({
                message: 'Alamat utama berhasil diatur',
                data: address
            });
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return res.status(500).json({ message: 'Gagal mengatur alamat utama' });
        }
    }


}

module.exports = ProfileController;
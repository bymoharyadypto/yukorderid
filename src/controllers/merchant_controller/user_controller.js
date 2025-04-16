const db = require('../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const dayjs = require('dayjs')
const { normalizePhone, isValidMobilePhoneNumber, generateOtpCode } = require('../../utils/otpUtils');
const { sendOtpWhatsapp } = require('../../utils/otpUtils');
const { signAccessToken, signRefreshToken } = require('../../helpers/jwt');

class UserController {
    static async requestOtp(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { phoneNumber } = req.body;
            if (!phoneNumber) {
                return res.status(400).json({ message: 'Phone number wajib diisi' });
            }
            if (!await isValidMobilePhoneNumber(phoneNumber)) throw { status: 400, message: 'Nomor tidak valid' };

            const normalizedPhone = await normalizePhone(phoneNumber);
            const activeOtp = await db.UserOtps.findOne({
                where: {
                    identifier: normalizedPhone,
                    type: 'register',
                    expiresAt: { [Op.gt]: new Date() },
                    verifiedAt: null,
                },
                order: [['createdAt', 'DESC']]
            });

            console.log(activeOtp, 'activeOtp');


            if (activeOtp) throw { status: 400, message: 'OTP masih aktif, silakan tunggu beberapa menit' };

            if (activeOtp && activeOtp.verifiedAt == null) {
                await verifiedOtp.destroy({ transaction });
            }

            const otp = await generateOtpCode();
            const user = await db.Users.findOrCreate({
                where: { phoneNumber: normalizedPhone },
                defaults: { phoneNumber: normalizedPhone, isVerified: false },
                transaction
            });

            await db.UserOtps.create({
                userId: user[0].id,
                identifier: normalizedPhone,
                otp,
                type: 'register',
                expiresAt: moment().add(1, 'minutes').toDate(),
            }, { transaction });

            // await sendOtpWhatsapp(otp, normalizedPhone);
            await transaction.commit();
            res.status(200).json({ success: true, message: 'OTP berhasil dikirim', phoneNumber: normalizedPhone, otp });
        } catch (err) {
            console.error(err);

            await transaction.rollback();
            res.status(err.status || 500).json({ success: false, message: err.message || 'Gagal request OTP' });
        }
    };

    static async verifyOtp(req, res) {
        const transaction = await db.sequelize.transaction();
        const { phoneNumber, otp, } = req.body;
        try {
            if (!phoneNumber || !otp) {
                return res.status(400).json({ message: 'Phone number dan OTP wajib diisi' });
            }

            if (!await isValidMobilePhoneNumber(phoneNumber)) throw { status: 400, message: 'Nomor tidak valid' };

            const normalizedPhone = await normalizePhone(phoneNumber);

            const userOtp = await db.UserOtps.findOne({
                where: {
                    identifier: normalizedPhone,
                    otp,
                    verifiedAt: { [Op.is]: null },
                    expiresAt: { [Op.gt]: new Date() }
                },
                order: [['createdAt', 'DESC']]
            });
            if (!userOtp) throw { status: 400, message: 'OTP tidak valid atau sudah digunakan / kadaluarsa' };

            const user = await db.Users.findByPk(userOtp.userId, {
                include: {
                    model: db.Roles,
                    as: 'role',
                    attributes: ['name']
                }
            });
            if (!user) throw { status: 400, message: 'User tidak ditemukan' };
            if (!user.role) throw { status: 400, message: 'Role user tidak ditemukan' };

            const isProfileComplete = !!(user.name && user.email);

            // const merchants = await db.Merchants.findAll({
            //     where: { userId: user.id },
            //     attributes: ['id', 'name']
            // });

            // const merchantData = merchants.map(m => ({
            //     id: m.id,
            //     name: m.name
            // }));

            // const merchantIds = merchants.map(m => m.id);

            await userOtp.update({ verifiedAt: new Date() }, { transaction });

            const existingToken = await db.RefreshTokens.findOne({
                where: {
                    userId: user.id,
                    expiresAt: { [Op.gt]: new Date() }
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingToken) {
                await existingToken.destroy({ transaction });
            }

            const accessToken = signAccessToken({
                id: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role.name,
                // merchants: merchantData
            });

            const refreshToken = signRefreshToken({
                id: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role.name,
                // merchants: merchantData
            });

            await db.RefreshTokens.create({
                userId: user.id,
                token: refreshToken,
                expiresAt: dayjs().add(7, 'days').toDate()
            }, { transaction });

            await transaction.commit();
            res.status(200).send({
                message: 'OTP terverifikasi',
                isProfileComplete,
                accessToken,
                refreshToken
            });
        } catch (err) {
            await transaction.rollback();
            res.status(err.status || 500).send({ message: err.message || 'Gagal verifikasi OTP' });
        }
    }

    static async registerUserMerchant(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, email, storeName, address, district, city, province, packageId } = req.body;
            const userId = req.user.id
            // const user = await db.Users.findOne({ where: { phoneNumber } });
            const user = await db.Users.findByPk(userId);

            if (!user) throw { status: 404, message: 'User tidak ditemukan' };

            const role = await db.Roles.findOne({ where: { name: 'merchant' } });
            if (!role) throw { status: 404, message: 'Role merchant tidak ditemukan' };

            await user.update({
                name,
                email,
                isVerified: true,
                roleId: role.id,
            }, { transaction });

            const merchant = await db.Merchants.create({
                userId: user.id,
                storeName,
                isActive: true,
            }, { transaction });

            await db.MerchantProfiles.create({
                merchantId: merchant.id,
                address,
                district,
                city,
                province,
            }, { transaction });

            await db.MerchantSubscriptions.create({
                merchantId: merchant.id,
                packageId,
                isActive: true,
            }, { transaction });


            const existingToken = await db.RefreshTokens.findOne({
                where: {
                    userId: user.id,
                    expiresAt: { [Op.gt]: new Date() }
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingToken) {
                await existingToken.destroy({ transaction });
            }

            const updatedUser = await db.Users.findByPk(user.id, {
                include: { model: db.Roles, as: 'role' }
            });

            const accessToken = signAccessToken({
                id: updatedUser.id,
                phoneNumber: updatedUser.phoneNumber,
                role: updatedUser.role,
            });

            const refreshToken = signRefreshToken({
                id: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role.name,
            });

            await db.RefreshTokens.create({
                userId: user.id,
                token: refreshToken,
                expiresAt: dayjs().add(7, 'days').toDate()
            }, { transaction });

            await transaction.commit();
            res.status(200).send({
                message: 'Registrasi merchant berhasil',
                accessToken,
                refreshToken
            });
        } catch (err) {
            await transaction.rollback();
            console.error(err);
            res.status(err.status || 500).send({ message: err.message || 'Gagal verifikasi OTP' });
        }
    }
}


module.exports = UserController;
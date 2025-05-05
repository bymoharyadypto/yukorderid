const db = require('../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const slugify = require('slugify');
const { normalizePhone, isValidMobilePhoneNumber, generateOtpCode } = require('../../utils/otpUtils');
const { sendOtpWhatsapp } = require('../../utils/otpUtils');
const { signAccessToken, signRefreshToken } = require('../../helpers/jwt');
const { signAccessTokenWithMerchants, signRefreshTokenWithMerchants, signAccessTokenForCustomer, signRefreshTokenForCustomer } = require('../../helpers/tokenHelper');

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
                    // type: null,
                    // expiresAt: { [Op.gt]: new Date() },
                    // verifiedAt: null,
                },
                order: [['createdAt', 'DESC']]
            });


            if (activeOtp) {
                const isExpired = activeOtp.expiresAt < new Date();
                const isUsed = activeOtp.verifiedAt !== null;

                if (!isExpired && !isUsed) {
                    return res.status(400).json({ message: 'OTP masih aktif, silakan tunggu beberapa saat' });
                }

                await activeOtp.destroy({ transaction });
            }

            const otp = await generateOtpCode();
            const [user] = await db.Users.findOrCreate({
                where: { phoneNumber: normalizedPhone },
                defaults: { phoneNumber: normalizedPhone, isVerified: false },
                transaction
            });

            await db.UserOtps.create({
                userId: user.id,
                identifier: normalizedPhone,
                otp,
                type: null,
                expiresAt: moment().add(1, 'minutes').toDate(),
            }, { transaction });

            // await sendOtpWhatsapp(otp, normalizedPhone);
            await transaction.commit();
            return res.status(200).json({ success: true, message: 'OTP berhasil dikirim', phoneNumber: normalizedPhone, otp });
        } catch (err) {
            console.error(err);

            await transaction.rollback();
            return res.status(err.status || 500).json({ success: false, message: err.message || 'Gagal request OTP' });
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
                    // attributes: ['name']
                }
            });
            if (!user) throw { status: 400, message: 'User tidak ditemukan' };
            // if (!user.role) throw { status: 400, message: 'Role user tidak ditemukan' };

            const isProfileComplete = !!(user.name && user.email);

            const roleName = user.role?.name || 'guest';
            user.role = roleName;

            // const merchants = await db.Merchants.findAll({
            //     where: { userId: user.id, isActive: true, },
            //     attributes: ['id']
            // });

            // const merchantIds = merchants.map(m => m.id);

            await userOtp.update({ verifiedAt: new Date(), type: 'login' }, { transaction });

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

            const accessToken = await signAccessTokenWithMerchants(user);
            const refreshToken = await signRefreshTokenWithMerchants(user);
            // const accessToken = signAccessToken({
            //     id: user.id,
            //     phoneNumber: user.phoneNumber,
            //     role: roleName,
            //     isProfileComplete,
            //     merchantIds
            // });

            // const refreshToken = signRefreshToken({
            //     id: user.id,
            //     phoneNumber: user.phoneNumber,
            //     role: roleName,
            //     isProfileComplete,
            //     merchantIds
            // });

            await db.RefreshTokens.create({
                userId: user.id,
                token: refreshToken,
                expiresAt: dayjs().add(7, 'days').toDate()
            }, { transaction });

            await transaction.commit();
            return res.status(200).send({
                message: 'OTP terverifikasi',
                isProfileComplete,
                accessToken,
                refreshToken
            });
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            return res.status(err.status || 500).send({ message: err.message || 'Gagal verifikasi OTP' });
        }
    }

    static async registerUserMerchant(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, email, storeName, address, district, city, province, packageId, paymentMethodId, transferProofUrl, notes } = req.body;
            console.log(req.user, "req.user");

            const existingUser = await db.Users.findOne({
                where: {
                    phoneNumber: req.user.phoneNumber
                }
            });

            // console.log(existingUser, "existingUser");


            if (existingUser && existingUser.isVerified) {
                throw { status: 400, message: "Email atau Nomor Telepon sudah terdaftar dan terverifikasi" };
            }
            // const user = await db.Users.findByPk(userId);

            // if (!user) throw { status: 404, message: 'User tidak ditemukan' };

            // if (!isEmailValid(email)) throw { status: 400, message: "Format email tidak valid" };
            // const emailOk = await isEmailDeliverable(email);
            // if (!emailOk) throw { status: 400, message: "Email tidak dapat dikirim (domain tidak valid atau disposable)" };

            const role = await db.Roles.findOne({ where: { name: 'merchant' } });
            if (!role) throw { status: 404, message: 'Role merchant tidak ditemukan' };

            await existingUser.update({
                name,
                email,
                isVerified: true,
                roleId: role.id,
            }, { transaction });

            // const subdomain = slugify(storeName, { lower: true, strict: true });
            const subdomain = storeName.replace(/\s+/g, '').toLowerCase().replace(/[^a-z0-9]/gi, '');
            // console.log(subdomain, 'subdomain');
            const storeUrl = `https://yukorder.id/${subdomain}`;
            const existingMerchant = await db.Merchants.findOne({ where: { subdomain } });
            if (existingMerchant) {
                throw { status: 400, message: 'Subdomain sudah digunakan, pilih nama toko lain.' };
            }

            const merchant = await db.Merchants.create({
                userId: existingUser.id,
                storeName,
                subdomain,
                storeUrl,
                isActive: true,
            }, { transaction });

            await db.MerchantProfiles.create({
                merchantId: merchant.id,
                address,
                district,
                city,
                province,
            }, { transaction });

            const selectedPackage = await db.MerchantPackages.findByPk(packageId);

            if (!selectedPackage) {
                throw { status: 404, message: 'Paket tidak ditemukan' };
            }

            const order = await db.Orders.create({
                userId: existingUser.id,
                totalAmount: selectedPackage.price,
                status: 'Pending',
                userType: 'Merchant',
                orderType: 'Subscription',
                paymentStatus: 'Pending',
            }, { transaction });

            await db.OrderItems.create({
                orderId: order.id,
                merchantProductId: selectedPackage.id,
                quantity: 1,
                total: selectedPackage.price
            }, { transaction });

            await db.MerchantSubscriptions.create({
                merchantId: merchant.id,
                orderId: order.id,
                packageId,
                isActive: true,
            }, { transaction });


            const paymentMethod = await db.PaymentMethods.findOne({
                where: { id: paymentMethodId, isActive: true },
            });

            if (!paymentMethod) throw { status: 404, message: 'Metode pembayaran manual tidak ditemukan' };

            const payment = await db.Payments.create({
                orderId: order.id,
                merchantId: merchant.id,
                paymentMethodId: paymentMethod.id,
                amount: selectedPackage.price,
                status: 'Pending',
                paidAt: null,
            }, { transaction });

            await db.PaymentVerifications.create({
                paymentId: payment.id,
                transferProofUrl,
                uploadedAt: new Date(),
                verifiedAt: null,
                verifiedBy: null,
                notes: notes ?? null,
                status: 'Pending',
            }, { transaction });

            const existingToken = await db.RefreshTokens.findOne({
                where: {
                    userId: existingUser.id,
                    expiresAt: { [Op.gt]: new Date() }
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingToken) {
                await existingToken.destroy({ transaction });
            }

            const updatedUser = await db.Users.findByPk(existingUser.id, {
                include: { model: db.Roles, as: 'role' }
            });

            // console.log(updatedUser, "updatedUser");

            // const accessToken = signAccessToken({
            //     id: updatedUser.id,
            //     phoneNumber: updatedUser.phoneNumber,
            //     role: updatedUser.role,
            //     merchantIds: [merchant.id]
            // });

            // const refreshToken = signRefreshToken({
            //     id: user.id,
            //     phoneNumber: user.phoneNumber,
            //     role: updatedUser.role,
            //     merchantIds: [merchant.id]
            // });
            const accessToken = await signAccessTokenWithMerchants(updatedUser, transaction);
            const refreshToken = await signRefreshTokenWithMerchants(updatedUser, transaction);

            await db.RefreshTokens.create({
                userId: existingUser.id,
                token: refreshToken,
                expiresAt: dayjs().add(7, 'days').toDate()
            }, { transaction });

            await transaction.commit();
            return res.status(201).send({
                message: 'Registrasi merchant berhasil',
                accessToken,
                refreshToken
            });
        } catch (err) {
            await transaction.rollback();
            console.error(err);
            return res.status(err.status || 500).send({ message: err.message || 'Gagal verifikasi OTP' });
        }
    }

    static async registerUserCustomer(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { name, email, address, city, province, postalCode } = req.body;

            if (!name || !email) {
                throw { status: 400, message: "Nama dan Email wajib diisi" };
            }

            const role = await db.Roles.findOne({ where: { name: 'customer' } });
            if (!role) throw { status: 404, message: 'Role customer tidak ditemukan' };

            const existingUser = await db.Users.findOne({
                where: {
                    [Op.or]: [{ email }, { phoneNumber: req.user.phoneNumber }]
                }
            });

            if (existingUser && existingUser.isVerified) {
                throw { status: 400, message: "Email atau Nomor Telepon sudah terdaftar dan terverifikasi" };
            }

            // const user = await db.Users.create({
            //     name,
            //     email,
            //     isVerified: true,
            //     roleId: role.id
            // }, { transaction });


            await existingUser.update({
                name,
                email,
                isVerified: true,
                roleId: role.id,
            }, { transaction });


            await db.CustomerProfiles.create({
                userId: existingUser.id,
                address,
                city,
                province,
                postalCode,
                image: null
            }, { transaction });

            const existingToken = await db.RefreshTokens.findOne({
                where: {
                    userId: existingUser.id,
                    expiresAt: { [Op.gt]: new Date() }
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingToken) {
                await existingToken.destroy({ transaction });
            }

            const updatedUser = await db.Users.findByPk(existingUser.id, {
                include: { model: db.Roles, as: 'role' }
            });

            console.log(updatedUser);


            const accessToken = await signAccessTokenForCustomer(updatedUser);
            const refreshToken = await signRefreshTokenForCustomer(updatedUser);

            await db.RefreshTokens.create({
                userId: existingUser.id,
                token: refreshToken,
                expiresAt: dayjs().add(7, 'days').toDate()
            }, { transaction });

            await transaction.commit();
            return res.status(201).send({
                message: 'Registrasi customer berhasil',
                accessToken,
                refreshToken
            });

        } catch (err) {
            await transaction.rollback();
            console.error(err);
            return res.status(err.status || 500).send({ message: err.message || 'Gagal registrasi customer' });
        }
    }


    static async getUserProfile(req, res) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized: ID user tidak ditemukan" });
            }

            const user = await db.Users.findOne({
                where: { id: userId },
                attributes: ['id', 'name', 'email', 'phoneNumber'],
                include: [
                    {
                        model: db.Roles,
                        as: 'role',
                        attributes: ['id', 'name']
                    },
                    {
                        model: db.Merchants,
                        as: 'merchants',
                        attributes: ['id', 'storeName', 'storeUrl', 'isActive'],
                        include: [
                            {
                                model: db.MerchantProfiles,
                                as: 'merchantProfile',
                                attributes: ['id', "subText", 'logo', 'bannerUrl', 'address', 'phone', 'district', 'city', 'province']
                            },
                            {
                                model: db.MerchantSubscriptions,
                                as: 'subscription',
                                where: { isActive: true },
                                required: false,
                                attributes: ['startDate', 'endDate', 'isActive'],
                                include: [
                                    {
                                        model: db.MerchantPackages,
                                        as: 'package',
                                        attributes: ['id', 'name', 'price', 'durationInDays']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }

            return res.status(200).json({ data: user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Gagal mengambil data profil user", error: error.message });
        }
    }

}


module.exports = UserController;
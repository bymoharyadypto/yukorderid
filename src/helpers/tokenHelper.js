const { signAccessToken, signRefreshToken } = require('./jwt');
const db = require('../models');

async function getMerchantIdsByUser(userId, transaction) {
    const merchants = await db.Merchants.findAll({
        where: { userId, isActive: true },
        attributes: ['id'],
        transaction
    });
    return merchants.map(m => m.id);
}

async function signAccessTokenWithMerchants(user, transaction, options = {}) {
    const merchantIds = await getMerchantIdsByUser(user.id, transaction);
    // console.log(merchantIds, "merchantIds token");

    return signAccessToken({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileComplete: options.isProfileComplete || false,
        merchantIds
    });
}

async function signRefreshTokenWithMerchants(user, transaction, options = {}) {
    const merchantIds = await getMerchantIdsByUser(user.id, transaction);
    // console.log(merchantIds, "merchantIds refresh token");

    return signRefreshToken({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileComplete: options.isProfileComplete || false,
        merchantIds
    });
}

async function signAccessTokenForCustomer(user, options = {}) {
    console.log("signAccessTokenForCustomer", user, options);

    return signAccessToken({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileComplete: options.isProfileComplete || false,
    });
}

async function signRefreshTokenForCustomer(user, options = {}) {
    return signRefreshToken({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileComplete: options.isProfileComplete || false,
    });
}

module.exports = {
    getMerchantIdsByUser,
    signAccessTokenWithMerchants,
    signRefreshTokenWithMerchants,
    signAccessTokenForCustomer,
    signRefreshTokenForCustomer
};

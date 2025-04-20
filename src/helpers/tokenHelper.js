const { signAccessToken, signRefreshToken } = require('./jwt');
const db = require('../models');

async function getMerchantIdsByUser(userId) {
    const merchants = await db.Merchants.findAll({
        where: { userId, isActive: true },
        attributes: ['id']
    });
    return merchants.map(m => m.id);
}

async function signAccessTokenWithMerchants(user, options = {}) {
    const merchantIds = await getMerchantIdsByUser(user.id);
    return signAccessToken({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileComplete: options.isProfileComplete || false,
        merchantIds
    });
}

async function signRefreshTokenWithMerchants(user, options = {}) {
    const merchantIds = await getMerchantIdsByUser(user.id);
    return signRefreshToken({
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileComplete: options.isProfileComplete || false,
        merchantIds
    });
}

module.exports = {
    getMerchantIdsByUser,
    signAccessTokenWithMerchants,
    signRefreshTokenWithMerchants
};

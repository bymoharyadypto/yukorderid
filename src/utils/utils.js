const db = require('../models');
const { Op, literal } = require('sequelize');
const dayjs = require('dayjs');

function transformDataArray(sourceArray, mappings) {
    if (!Array.isArray(sourceArray)) return [];

    return sourceArray.map(source =>
        Object.fromEntries(
            Object.entries(mappings).map(([key, value]) => [
                key,
                typeof value === "function" ? value(source) : source[value],
            ])
        )
    );
}

async function getShippingRateByLocation(merchantId, city, province, courier = 'JNE', service = 'REG') {
    const rate = await db.MerchantShippingRates.findOne({
        where: {
            merchantId,
            courierName: courier,
            serviceType: service,
            status: 'active',
            [Op.or]: [
                { city: city },
                { province: province, city: null },
                { province: null, city: null }
            ]
        },
        order: [
            [literal('city IS NULL'), 'ASC'],
            ['city', 'DESC'],
            [literal('province IS NULL'), 'ASC'],
            ['province', 'DESC']
        ]
    });
    console.log(rate);

    return rate;
}

function generateUniqueCode(prefix) {
    const now = dayjs().format('YYYYMMDD');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${now}${random}`;
}

module.exports = {
    transformDataArray, getShippingRateByLocation, generateUniqueCode
};
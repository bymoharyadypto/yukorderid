const db = require('../models');
const { Op, literal } = require('sequelize');

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

module.exports = {
    transformDataArray, getShippingRateByLocation
};
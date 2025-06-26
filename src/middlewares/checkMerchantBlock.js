const db = require('../models');

async function checkMerchantBlock(req, res, next) {
    try {
        const userId = req.user.id;

        const merchant = await db.Merchants.findOne({
            where: {
                userId,
            }
        });

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        if (merchant.isBlock) {
            return res.status(403).json({ message: 'Access denied: merchant is blocked' });
        }

        req.merchant = merchant;

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkMerchantBlock;

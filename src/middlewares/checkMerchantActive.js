const db = require('../models');

async function checkMerchantActive(req, res, next) {
    try {
        const userId = req.user.id;

        const merchant = await db.Merchants.findOne({ where: { userId } });

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        if (!merchant.isActive) {
            return res.status(403).json({ message: 'Your merchant is not active' });
        }

        req.merchant = merchant;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkMerchantActive;

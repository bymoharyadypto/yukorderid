const db = require('../models');
const { Op } = require('sequelize');
const { verifyAccessToken } = require('../helpers/jwt');
async function authentication(req, res, next) {
    const authHeader = req.headers.accessToken;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Token tidak valid' });
    }
}

async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token tidak ditemukan atau format salah' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyAccessToken(token);

        const user = await db.Users.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        req.user = {
            id: user.id,
            phoneNumber: user.phoneNumber,
            role: decoded.role,
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }
}

async function canRegisterMerchant(req, res, next) {
    try {
        const userId = req.user.id;

        const user = await db.Users.findByPk(userId, {
            include: {
                model: db.Roles,
                as: 'role',
                attributes: ['name']
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        if (user.role && user.role.name === 'merchant') {
            return res.status(400).json({ message: 'User sudah terdaftar sebagai merchant' });
        }

        const isProfileComplete = !!(user.name && user.email);
        if (isProfileComplete) {
            return res.status(400).json({ message: 'Profil sudah lengkap, tidak perlu daftar ulang' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: err.message || 'Gagal validasi akses merchant' });
    }
}


module.exports = { authentication, verifyToken, canRegisterMerchant };
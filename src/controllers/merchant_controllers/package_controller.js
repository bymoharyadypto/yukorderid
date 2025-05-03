const db = require('../../models');

class PackageController {

    static async getAllPackages(req, res) {
        try {
            const packages = await db.MerchantPackages.findAll({
                attributes: ['id', 'name', 'price', 'durationInDays', 'description'],
                include: [
                    {
                        model: db.MerchantFeatures,
                        as: 'features',
                        attributes: ['id', 'name', 'description'],
                        through: {
                            model: db.MerchantPackageFeatures,
                            attributes: ['defaultLimit'],
                        },
                    },
                ],
            });

            const formattedPackages = packages.map(pkg => {
                const { features, ...packageData } = pkg.toJSON();

                return {
                    ...packageData,
                    features: features.map(feature => ({
                        id: feature.id,
                        name: feature.name,
                        description: feature.description,
                        defaultLimit: feature.MerchantPackageFeatures?.defaultLimit ?? 'Unlimited'
                    }))
                };
            });

            res.status(200).json({
                success: true,
                message: 'Berhasil mengambil data paket',
                data: formattedPackages
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data paket',
            });
        }
    }
}

module.exports = PackageController
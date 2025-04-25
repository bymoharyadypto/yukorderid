const db = require('../../models');

class PackageController {

    static async getAllPackages(req, res) {
        try {
            const packages = await db.Packages.findAll({
                attributes: ['id', 'name', 'price', 'durationInDays', 'description'],
                include: [
                    {
                        model: db.Features,
                        as: 'features',
                        attributes: ['id', 'name', 'description'],
                        through: {
                            model: db.PackageFeatures,
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
                        defaultLimit: feature.PackageFeatures?.defaultLimit ?? 'Unlimited'
                    }))
                };
            });

            res.status(200).json({
                success: true,
                message: 'Successfully to retrieve packages',
                data: formattedPackages
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve packages',
            });
        }
    }
}

module.exports = PackageController
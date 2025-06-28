const db = require('../../models');

class MerchantProductManageController {
    static async getMerchantProductList(req, res) {
        try {
            // const { merchantId } = req.params;
            const { currentPage = 1, perPage = 10, orderBy = 'createdAt', orderDirection = 'DESC', search = '' } = req.query;

            const offset = (parseInt(currentPage) - 1) * parseInt(perPage);
            const limit = parseInt(perPage);

            const whereClause = {
                // merchantId,
                ...(search && {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } }
                    ]
                })
            };

            const { count, rows } = await db.MerchantProducts.findAndCountAll({
                where: whereClause,
                distict: true,
                include: [
                    {
                        model: db.MerchantProductImages,
                        as: 'images',
                        attributes: ['id', 'imageUrl']
                    },
                    {
                        model: db.Categories,
                        as: 'categories',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: db.MerchantProductVariants,
                        attributes: ['id', 'name'],
                        as: 'variants',
                    },
                    {
                        model: db.MerchantProductVariantOptions,
                        as: 'variantOptions',
                        attributes: ['id', 'price', 'crossedPrice', 'stock', 'isActive'],
                        include: [
                            {
                                model: db.MerchantProductVariantOptionValues,
                                as: 'optionValues',
                                attributes: ['id', 'value'],
                                include: [
                                    {
                                        model: db.MerchantProductVariants,
                                        as: 'variant',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.MerchantDiscounts,
                        as: 'discounts',
                        attributes: ['id', 'code', 'description', 'discountType', 'discountValue', 'startDate', 'endDate', 'isActive'],
                        through: { attributes: ['merchantProductId', 'merchantDiscountId'] },
                        required: false
                    },
                ],
                order: [[orderBy, orderDirection]],
                offset,
                limit
            });

            res.status(200).json({
                message: "Success",
                data: {
                    totalCount: count,
                    currentPage: parseInt(currentPage),
                    totalPages: Math.ceil(count / perPage),
                    products: rows
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Gagal mendapatkan daftar produk" });
        }
    }

    static async getMerchantProductDetail(req, res) {
        try {
            const { productId } = req.params;

            const product = await db.MerchantProducts.findOne({
                where: { id: productId },
                include: [
                    {
                        model: db.MerchantProductImages,
                        as: 'images',
                        attributes: ['id', 'imageUrl']
                    },
                    {
                        model: db.MerchantProductVariants,
                        attributes: ['id', 'name'],
                        as: 'variants',
                    },
                    {
                        model: db.MerchantProductVariantOptions,
                        as: 'variantOptions',
                        attributes: ['id', 'price', 'crossedPrice', 'stock', 'isActive'],
                        include: [
                            {
                                model: db.MerchantProductVariantOptionValues,
                                as: 'optionValues',
                                attributes: ['id', 'value'],
                                include: [
                                    {
                                        model: db.MerchantProductVariants,
                                        as: 'variant',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.Categories,
                        as: 'categories',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: db.MerchantDiscounts,
                        as: 'discounts',
                        attributes: ['id', 'code', 'description', 'discountType', 'discountValue', 'startDate', 'endDate', 'isActive'],
                        through: { attributes: ['merchantProductId', 'merchantDiscountId'] },
                        required: false
                    },
                ]
            });

            if (!product) {
                return res.status(404).json({ message: "Produk tidak ditemukan" });
            }

            res.status(200).json({ message: "Success", data: product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Gagal mendapatkan detail produk" });
        }
    }

    static async changeMerchantProductStatus(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { productId } = req.params;
            const { isActive } = req.body;

            if (typeof isActive !== 'boolean') {
                return res.status(400).json({ message: "Status tidak valid" });
            }

            const product = await db.MerchantProducts.findOne({
                where: { id: productId },
                transaction
            });

            if (!product) {
                return res.status(404).json({ message: "Produk tidak ditemukan" });
            }

            product.isActive = isActive;
            await product.save({ transaction });

            await transaction.commit();
            res.status(200).json({ message: "Status produk berhasil diperbarui", data: product });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({ message: "Gagal memperbarui status produk" });
        }
    }

    static async deleteMerchantProduct(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { productId } = req.params;

            const product = await db.MerchantProducts.findOne({
                where: { id: productId },
                transaction
            });

            if (!product) {
                return res.status(404).json({ message: "Produk tidak ditemukan" });
            }

            await product.update({ deletedAt: new Date() }, { transaction });

            await transaction.commit();
            res.status(200).json({ message: "Produk berhasil dihapus" });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({ message: "Gagal menghapus produk" });
        }
    }
}

module.exports = MerchantProductManageController;
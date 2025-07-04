const db = require('../../models');

class MerchantProductController {
    static async createMerchantProduct(req, res) {
        const transaction = await db.sequelize.transaction();
        const { merchantId } = req.params;
        const { id: userId } = req.user;
        try {
            const {
                name,
                description,
                price,
                crossedPrice,
                stock,
                isPreOrder,
                preOrderDays,
                isActive,
                imageUrls,
                categories,
                variants,
                variantOptions,
                weight,
                dimensions,
                packaging,
            } = req.body;

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }

            if (!name || !description || !imageUrls?.length || !merchantId) {
                return res.status(400).json({ message: 'Data produk tidak lengkap' });
            }

            if (imageUrls.length > 5) {
                return res.status(400).json({ message: 'Maksimal 5 gambar yang diperbolehkan' });
            }

            const hasVariants = Array.isArray(variants) && variants.length > 0;

            let totalVariantStock = 0;
            if (hasVariants) {
                for (const variant of variants) {
                    if (Array.isArray(variant.options)) {
                        totalVariantStock += variant.options.reduce((sum, option) => sum + option.stock, 0);
                    }
                }
            }

            if (totalVariantStock > stock) {
                return res.status(400).json({ message: 'Total stok varian tidak boleh melebihi stok produk utama' });
            }

            const product = await db.MerchantProducts.create({
                merchantId: merchant.id,
                name,
                description,
                price: price ?? null,
                crossedPrice: crossedPrice ?? null,
                stock,
                isPreOrder,
                preOrderDays,
                isActive,
                weight,
                dimensions,
                packaging,
            }, { transaction });

            const imageData = imageUrls.map(url => ({
                merchantProductId: product.id,
                imageUrl: url
            }));

            await db.MerchantProductImages.bulkCreate(imageData, { transaction });

            // const categoryIds = [];

            // for (const cat of categories) {
            //     if (typeof cat === 'number') {
            //         categoryIds.push(cat);
            //     } else if (typeof cat === 'string') {
            //         const [category] = await db.Categories.findOrCreate({
            //             where: { name: cat },
            //             defaults: { name: cat },
            //             transaction
            //         });
            //         categoryIds.push(category.id);
            //     }
            // }

            // const uniqueCategoryIds = [...new Set(rawCategoryIds)];

            // const categoryData = categoryIds.map(categoryId => ({
            //     merchantProductId: product.id,
            //     categoryId
            // }));

            // await db.MerchantProductCategories.bulkCreate(categoryData, { transaction });
            const rawCategoryIds = [];

            for (const cat of categories) {
                if (typeof cat === 'number') {
                    rawCategoryIds.push(cat);
                } else if (typeof cat === 'string') {
                    const [category] = await db.Categories.findOrCreate({
                        where: { name: cat.trim() },
                        defaults: { name: cat.trim() },
                        transaction
                    });
                    rawCategoryIds.push(category.id);
                }
            }

            const uniqueCategoryIds = [...new Set(rawCategoryIds)];

            const categoryData = uniqueCategoryIds.map(categoryId => ({
                merchantProductId: product.id,
                categoryId
            }));

            await db.MerchantProductCategories.bulkCreate(categoryData, {
                transaction,
                ignoreDuplicates: true
            });

            if (hasVariants) {
                const variantMap = {};
                // for (const variant of variants) {
                //     const variantRecord = await db.MerchantProductVariants.create({
                //         merchantProductId: product.id,
                //         name: variant.name
                //     }, { transaction });

                //     if (Array.isArray(variant.options)) {
                //         const optionData = variant.options.map(option => ({
                //             merchantProductVariantId: variantRecord.id,
                //             value: option.value,
                //             price: option.price,
                //             crossedPrice: option.crossedPrice,
                //             stock: option.stock,
                //             isActive: option.isActive
                //         }));
                //         await db.MerchantProductVariantOptions.bulkCreate(optionData, { transaction });
                //     }
                // }
                for (const variant of variants) {
                    const variantRecord = await db.MerchantProductVariants.create({
                        merchantProductId: product.id,
                        name: variant.name
                    }, { transaction });

                    for (const value of variant.values) {
                        variantMap[`${variant.name}:${value}`] = variantRecord.id;
                    }
                }

                for (const option of variantOptions) {
                    const optionRecord = await db.MerchantProductVariantOptions.create({
                        merchantProductId: product.id,
                        price: option.price,
                        crossedPrice: option.crossedPrice,
                        stock: option.stock,
                        isActive: option.isActive
                    }, { transaction });

                    for (const value of option.values) {
                        const matchedVariant = Object.entries(variantMap).find(([key]) => key.endsWith(`:${value}`));
                        if (!matchedVariant) continue;

                        const [key, merchantProductVariantId] = matchedVariant;

                        await db.MerchantProductVariantOptionValues.create({
                            merchantProductVariantOptionId: optionRecord.id,
                            merchantProductVariantId,
                            value
                        }, { transaction });
                    }
                }
            }

            await transaction.commit();
            return res.status(201).json({ message: 'Produk berhasil ditambahkan' });

        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Gagal membuat produk', error: error.message });
        }
    }

    static async getMerchantProducts(req, res) {
        try {

            const { merchantId } = req.params;
            const { isActive } = req.query;
            const { id: userId } = req.user


            if (!merchantId) {
                return res.status(400).json({ message: 'Merchant ID tidak boleh kosong' });
            }


            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }

            const whereCondition = { merchantId, deletedAt: null };
            if (isActive) {
                whereCondition.isActive = isActive;
            }

            const products = await db.MerchantProducts.findAll({
                where: whereCondition,
                attributes: ['id', 'name', 'description', "weight", "dimensions", "packaging", 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
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
                        // where: { isActive: true },
                        required: false
                    },
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ data: products });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Gagal mengambil produk merchant', error: error.message });
        }
    }

    static async getMerchantProductById(req, res) {
        try {
            const { merchantId, merchantProductId } = req.params;
            const { id: userId } = req.user;

            if (!merchantId || !merchantProductId) {
                return res.status(400).json({ message: 'Merchant ID dan Product ID wajib diisi' });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }

            const product = await db.MerchantProducts.findOne({
                where: {
                    id: merchantProductId,
                    merchantId,
                    deletedAt: null,
                    isActive: true
                },
                attributes: ['id', 'name', 'description', "weight", "dimensions", "packaging", 'price', 'crossedPrice', 'stock', 'isPreOrder', 'preOrderDays', 'isActive'],
                include: [
                    {
                        model: db.MerchantProductImages,
                        as: 'images',
                        attributes: ['id', 'imageUrl']
                    },
                    {
                        model: db.Categories,
                        as: 'categories',
                        attributes: ['id', 'name']
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
                        through: { attributes: [] },
                        // where: { isActive: true },
                        required: false
                    },
                ]
            });

            if (!product) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }

            return res.status(200).json({ data: product });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Gagal mengambil detail produk', error: error.message });
        }
    }

    static async updateMerchantProduct(req, res) {
        const transaction = await db.sequelize.transaction();
        const { merchantId, merchantProductId } = req.params;
        const { id: userId } = req.user;

        const merchant = await db.Merchants.findOne({
            where: { id: merchantId, userId, isActive: true }
        });

        if (!merchant) {
            return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
        }

        try {
            const {
                name,
                description,
                price,
                crossedPrice,
                stock,
                isPreOrder,
                preOrderDays,
                isActive,
                imageUrls,
                categories,
                variants,
                variantOptions,
                weight,
                dimensions,
                packaging
            } = req.body;

            if (!name || !description || !imageUrls?.length || !merchantId || !merchantProductId) {
                return res.status(400).json({ message: 'Data produk tidak lengkap' });
            }

            if (imageUrls.length > 5) {
                return res.status(400).json({ message: 'Maksimal 5 gambar yang diperbolehkan' });
            }

            const hasVariants = Array.isArray(variants) && variants.length > 0;

            let totalVariantStock = 0;
            if (hasVariants) {
                for (const variant of variants) {
                    if (Array.isArray(variant.options)) {
                        totalVariantStock += variant.options.reduce((sum, option) => sum + option.stock, 0);
                    }
                }
            }

            if (totalVariantStock > stock) {
                return res.status(400).json({ message: 'Total stok varian tidak boleh melebihi stok produk utama' });
            }

            const product = await db.MerchantProducts.findOne({ where: { id: merchantProductId, merchantId, deletedAt: null } });
            if (!product) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }

            await product.update({
                name,
                description,
                price: price ?? null,
                crossedPrice: crossedPrice ?? null,
                stock,
                isPreOrder,
                preOrderDays,
                isActive,
                weight,
                dimensions,
                packaging
            }, { transaction });

            if (imageUrls) {
                await db.MerchantProductImages.destroy({
                    where: { merchantProductId: product.id },
                    transaction
                });

                const imageData = imageUrls.map(url => ({
                    merchantProductId: product.id,
                    imageUrl: url
                }));
                await db.MerchantProductImages.bulkCreate(imageData, { transaction });
            }

            if (categories) {
                await db.MerchantProductCategories.destroy({
                    where: { merchantProductId: product.id },
                    transaction
                });

                const categoryIds = [];

                for (const cat of categories) {
                    if (typeof cat === 'number') {
                        categoryIds.push(cat);
                    } else if (typeof cat === 'string') {
                        const [category] = await db.Categories.findOrCreate({
                            where: { name: cat },
                            defaults: { name: cat },
                            transaction
                        });
                        categoryIds.push(category.id);
                    }
                }

                const categoryData = categoryIds.map(categoryId => ({
                    merchantProductId: product.id,
                    categoryId
                }));
                await db.MerchantProductCategories.bulkCreate(categoryData, { transaction });
            }

            if (hasVariants) {
                const variantOptionIds = await db.MerchantProductVariantOptions.findAll({
                    attributes: ['id'],
                    raw: true,
                    transaction
                });
                const optionIds = variantOptionIds.map(v => v.id);

                // Step 2: Hapus OptionValues
                if (optionIds.length > 0) {
                    await db.MerchantProductVariantOptionValues.destroy({
                        where: {
                            merchantProductVariantOptionId: optionIds
                        },
                        transaction
                    });
                }
                await db.MerchantProductVariantOptions.destroy({
                    where: { merchantProductId: product.id },
                    transaction
                });
                // await db.MerchantProductVariantOptionValues.destroy({
                //     where: { merchantProductId: product.id },
                //     transaction
                // });
                await db.MerchantProductVariants.destroy({
                    where: { merchantProductId: product.id },
                    transaction
                });

                const variantMap = {};
                for (const variant of variants) {
                    // const variantRecord = await db.MerchantProductVariants.create({
                    //     merchantProductId: product.id,
                    //     name: variant.name
                    // }, { transaction });

                    // if (Array.isArray(variant.options)) {
                    //     const optionData = variant.options.map(option => ({
                    //         merchantProductVariantId: variantRecord.id,
                    //         value: option.value,
                    //         price: option.price,
                    //         crossedPrice: option.crossedPrice,
                    //         stock: option.stock,
                    //         isActive: option.isActive
                    //     }));
                    //     await db.MerchantProductVariantOptions.bulkCreate(optionData, { transaction });
                    // }
                    const newVariant = await db.MerchantProductVariants.create({
                        merchantProductId: product.id,
                        name: variant.name
                    }, { transaction });
                    variantMap[variant.name] = newVariant.id;
                }
                for (const option of variantOptions) {
                    const newOption = await db.MerchantProductVariantOptions.create({
                        merchantProductId: product.id,
                        price: option.price,
                        crossedPrice: option.crossedPrice,
                        stock: option.stock,
                        isActive: option.isActive
                    }, { transaction });

                    const optionValueData = option.values.map(val => ({
                        merchantProductVariantOptionId: newOption.id,
                        merchantProductId: product.id,
                        merchantProductVariantId: variantMap[val.variantName],
                        value: val.value
                    }));

                    await db.MerchantProductVariantOptionValues.bulkCreate(optionValueData, { transaction });
                }
            }

            await transaction.commit();
            return res.status(200).json({ message: 'Produk berhasil diperbarui' });

        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Gagal memperbarui produk', error: error.message });
        }
    }

    static async updateProductStatus(req, res) {
        const transaction = await db.sequelize.transaction();
        try {
            const { merchantId, merchantProductId } = req.params;
            const { isActive } = req.body;
            const { id: userId } = req.user;

            if (!merchantId || !merchantProductId) {
                return res.status(400).json({ message: 'Merchant ID dan Product ID tidak boleh kosong' });
            }

            const merchant = await db.Merchants.findOne({
                where: { id: merchantId, userId, isActive: true }
            });

            if (!merchant) {
                return res.status(403).json({ error: 'Merchant tidak ditemukan untuk user ini' });
            }

            const [updatedRows] = await db.MerchantProducts.update(
                { isActive },
                {
                    where: { id: merchantProductId, merchantId, deletedAt: null },
                    transaction
                }
            );

            if (updatedRows === 0) {
                return res.status(404).json({ message: 'Produk tidak ditemukan atau tidak milik merchant ini' });
            }
            await transaction.commit();
            return res.status(200).json({ message: 'Status produk berhasil diperbarui', isActive });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ message: 'Gagal memperbarui status produk', error: error.message });
        }
    }


}

module.exports = MerchantProductController;
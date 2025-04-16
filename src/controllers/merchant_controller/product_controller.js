const db = require('../../models');
const { Op } = require('sequelize');

class MerchantProductController {
    static async createMerchantProduct(req, res) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                merchantId,
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
                variants
            } = req.body;

            // if (!name || !price || !stock || !imageUrls?.length || !merchantId) {
            //     return res.status(400).json({ message: 'Data produk tidak lengkap' });
            // }

            const hasVariants = Array.isArray(variants) && variants.length > 0;

            // if (!hasVariants && (!price || !stock)) {
            //     return res.status(400).json({ message: 'Harga dan stok wajib diisi jika tidak ada varian' });
            // }

            // let totalVariantStock = 0;
            // if (hasVariants) {
            //     for (const variant of variants) {
            //         if (Array.isArray(variant.options)) {
            //             totalVariantStock += variant.options.reduce((sum, option) => sum + option.stock, 0);
            //         }
            //     }
            // }

            // if (totalVariantStock > stock) {
            //     return res.status(400).json({ message: 'Total stok varian tidak boleh melebihi stok produk utama' });
            // }
            console.log("masuk 1");

            const product = await db.MerchantProducts.create({
                merchantId,
                name,
                description,
                price: price ?? null,
                crossedPrice: crossedPrice ?? null,
                stock,
                isPreOrder,
                preOrderDays,
                isActive
            }, { transaction });

            const imageData = imageUrls.map(url => ({
                merchantProductId: product.id,
                imageUrl: url
            }));

            await db.MerchantProductImages.bulkCreate(imageData, { transaction });
            // console.log("masuk 3");

            // if (Array.isArray(categories) && categories.length > 0) {
            //     const categoryData = categories.map(categoryId => ({
            //         merchantProductId: product.id,
            //         categoryId
            //     }));
            //     await MerchantProductCategory.bulkCreate(categoryData, { transaction });
            // }

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

            console.log("masuk 3");
            // if (Array.isArray(variants)) {
            //     for (const variant of variants) {
            //         const variantRecord = await db.MerchantProductVariants.create({
            //             merchantProductId: product.id,
            //             name: variant.name
            //         }, { transaction });

            //         if (Array.isArray(variant.options)) {
            //             const optionData = variant.options.map(optionValue => ({
            //                 merchantProductVariantId: variantRecord.id,
            //                 value: optionValue
            //             }));
            //             await MerchantProductVariantOptions.bulkCreate(optionData, { transaction });
            //         }
            //     }
            // }

            if (hasVariants) {
                for (const variant of variants) {
                    const variantRecord = await db.MerchantProductVariants.create({
                        merchantProductId: product.id,
                        name: variant.name
                    }, { transaction });

                    if (Array.isArray(variant.options)) {
                        const optionData = variant.options.map(option => ({
                            merchantProductVariantId: variantRecord.id,
                            value: option.value,
                            price: option.price,
                            crossedPrice: option.crossedPrice,
                            stock: option.stock,
                            isActive: option.isActive
                        }));
                        await db.MerchantProductVariantOptions.bulkCreate(optionData, { transaction });
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
}

module.exports = MerchantProductController;
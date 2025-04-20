const router = require("express").Router({ mergeParams: true });
const ProductController = require("../../controllers/merchant_controller/product_controller")
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');
const checkMerchantQuota = require('../../middlewares/checkMerchantQuota');


router.post("/", checkMerchantFeature('Maksimal Produk'), checkMerchantQuota('Maksimal Produk', 'MerchantProducts'), ProductController.createMerchantProduct)
router.get("/", ProductController.getMerchantProducts)
router.get("/:productId", ProductController.getMerchantProductById)
router.put("/:productId", ProductController.updateMerchantProduct)
router.patch("/:productId/status", ProductController.updateProductStatus)

module.exports = router;
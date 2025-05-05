const router = require("express").Router({ mergeParams: true });
const ProductController = require("../../controllers/merchant_controllers/product_controller")
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');
const checkMerchantQuota = require('../../middlewares/checkMerchantQuota');


router.post("/", checkMerchantFeature('Maksimal Produk'), checkMerchantQuota('Maksimal Produk', 'MerchantProducts'), ProductController.createMerchantProduct)
router.get("/", ProductController.getMerchantProducts)
router.get("/:merchantProductId", ProductController.getMerchantProductById)
router.put("/:merchantProductId", ProductController.updateMerchantProduct)
router.patch("/:merchantProductId/status", ProductController.updateProductStatus)

module.exports = router;
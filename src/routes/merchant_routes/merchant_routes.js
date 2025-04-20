const router = require("express").Router();
const MerchantController = require("../../controllers/merchant_controller/merchant_controller")
const productRoutes = require("./product_routes")
const discountRoutes = require("./discount_routes")

router.get("/", MerchantController.getUserMerchants)
router.get("/:merchantId", MerchantController.getUserMerchant)
router.use("/:merchantId/products", productRoutes)
router.use('/:merchantId/discounts', discountRoutes);


module.exports = router;


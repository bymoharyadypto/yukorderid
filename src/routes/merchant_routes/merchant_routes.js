const router = require("express").Router();
const MerchantController = require("../../controllers/merchant_controllers/merchant_controller")
const productRoutes = require("./product_routes")
const discountRoutes = require("./discount_routes")
const bankAccountRoutes = require("./bank_account_routes")
const orderRoutes = require("./order_routes")
const shippingRateRoutes = require("./shipping_rate_routes")

router.get("/", MerchantController.getUserMerchants)
router.get("/:merchantId", MerchantController.getUserMerchant)
router.put("/:merchantId", MerchantController.updateMerchantWithOperatingHours)
router.use("/:merchantId/products", productRoutes)
router.use("/:merchantId/discounts", discountRoutes);
router.use("/:merchantId/bank-accounts", bankAccountRoutes)
router.use("/:merchantId/customer-orders", orderRoutes)
router.use("/:merchantId/shipping-rates", shippingRateRoutes)


module.exports = router;


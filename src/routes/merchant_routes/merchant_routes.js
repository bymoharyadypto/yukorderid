const router = require("express").Router();
const MerchantController = require("../../controllers/merchant_controllers/merchant_controller")
const productRoutes = require("./product_routes")
const discountRoutes = require("./discount_routes")
const bankAccountRoutes = require("./bank_account_routes")
const orderRoutes = require("./order_routes")
const shippingRateRoutes = require("./shipping_rate_routes")
const qrisRoutes = require("./qris_routes")
const merchantPaymentMethodRoutes = require("./merchant_payment_method_routes")
const salesReportRoutes = require("./sales_report_routes")
const staffRoutes = require("./staff_routes")
const expenseRoutes = require("./expense_routes")
const homeRoutes = require("./home_routes")
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');

router.get("/", MerchantController.getUserMerchants)
router.get("/:merchantId", MerchantController.getUserMerchant)
router.put("/:merchantId", MerchantController.updateMerchantWithOperatingHours)
router.use("/:merchantId/home", homeRoutes)
router.use("/:merchantId/products", productRoutes)
router.use("/:merchantId/discounts", discountRoutes);
router.use("/:merchantId/payment-methods", merchantPaymentMethodRoutes)
router.use("/:merchantId/bank-accounts", bankAccountRoutes)
router.use("/:merchantId/qris", qrisRoutes)
router.use("/:merchantId/customer-orders", orderRoutes)
router.use("/:merchantId/shipping-rates", shippingRateRoutes)
router.use("/:merchantId/sales-report", checkMerchantFeature('Sales & Cost Report'), salesReportRoutes)
router.use("/:merchantId/staff", staffRoutes)
router.use("/:merchantId/expenses", expenseRoutes)

module.exports = router;


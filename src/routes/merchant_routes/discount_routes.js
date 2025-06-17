const router = require("express").Router({ mergeParams: true });
const DiscountController = require("../../controllers/merchant_controllers/discount_controller")
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');

router.get("/payment-methods", DiscountController.getPaymentMethods)
router.post("/", checkMerchantFeature('Fitur Diskon'), DiscountController.createDiscount)
router.get("/", DiscountController.getDiscounts)
router.patch("/:merchantDiscountId/status", DiscountController.updateDiscountStatus)

module.exports = router;

const router = require("express").Router({ mergeParams: true });
const DiscountController = require("../../controllers/merchant_controllers/discount_controller")

router.get("/payment-methods", DiscountController.getPaymentMethods)
router.post("/", DiscountController.createDiscount)
router.get("/", DiscountController.getDiscounts)
// router.patch("/:discountId/status", DiscountController.updateDiscountStatus)

module.exports = router;

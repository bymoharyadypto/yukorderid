const router = require("express").Router({ mergeParams: true });
const MerchantPaymentMethodController = require("../../controllers/merchant_controllers/merchant_payment_method_controller");

router.get("/", MerchantPaymentMethodController.getMerchantPaymentMethodList);
router.patch("/:methodId/status", MerchantPaymentMethodController.updateMerchantPaymentMethodStatus);


module.exports = router;

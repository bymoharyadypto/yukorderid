const router = require("express").Router();
const { verifyToken, canRegisterMerchant, validateUserMerchant } = require("../../middlewares/authentication");
const PackageController = require("../../controllers/merchant_controllers/package_controller");
const UserController = require("../../controllers/user_controllers/user_controller")
const PaymentMethodController = require("../../controllers/merchant_controllers/payment_method_controller")
const BankController = require("../../controllers/merchant_controllers/bank_controller")
const PaymentController = require("../../controllers/merchant_controllers/payment_controller")
const merchantRoutes = require("./merchant_routes")
const checkMerchantBlock = require("../../middlewares/checkMerchantBlock");
const checkMerchantActive = require("../../middlewares/checkMerchantActive");

router.get("/packages", PackageController.getAllPackages);
router.get("/payment-methods", PaymentMethodController.getAllPaymentMethods);
router.get("/banks", BankController.getBankList);

router.use(verifyToken)
router.post("/preview-checkout", UserController.previewCheckoutSubscription);
router.post("/create-package-payment", UserController.createPaymentWithMidtrans);
router.post("/register-merchant", canRegisterMerchant, UserController.registerUserMerchant)
router.use("/my-merchants", validateUserMerchant, checkMerchantBlock, checkMerchantActive, merchantRoutes)

module.exports = router;
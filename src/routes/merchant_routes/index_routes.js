const router = require("express").Router();
const { verifyToken, canRegisterMerchant, validateUserMerchant } = require("../../middlewares/authentication");
const PackageController = require("../../controllers/merchant_controllers/package_controller");
const UserController = require("../../controllers/user_controllers/user_controller")
const PaymentMethodController = require("../../controllers/merchant_controllers/payment_method_controller")
const merchantRoutes = require("./merchant_routes")

router.get("/packages", PackageController.getAllPackages);
router.get("/payment-methods", PaymentMethodController.getAllPaymentMethods);

router.use(verifyToken)
router.post("/register-merchant", canRegisterMerchant, UserController.registerUserMerchant)
router.use("/my-merchants", validateUserMerchant, merchantRoutes)

module.exports = router;
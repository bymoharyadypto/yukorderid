const router = require("express").Router();
const PackageController = require("../../controllers/merchant_controller/package_controller");
const UserController = require("../../controllers/merchant_controller/user_controller")
const { verifyToken, canRegisterMerchant } = require("../../middlewares/authentication");
const productRoutes = require("./product_route")

router.get("/package-list", PackageController.getAllPackages);
router.post("/request-otp", UserController.requestOtp);
router.post("/verify-otp", UserController.verifyOtp);

router.use(verifyToken)
router.post("/register-merchant", canRegisterMerchant, UserController.registerUserMerchant)
router.use("/products", productRoutes)

module.exports = router;
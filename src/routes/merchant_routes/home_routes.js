const router = require("express").Router({ mergeParams: true });
const HomeController = require("../../controllers/merchant_controllers/home_controller");
const PackageController = require("../../controllers/merchant_controllers/package_controller");

router.get("/", HomeController.getMerchantHomepageData);
router.get("/packages", PackageController.getAllPackages);
router.post("/preview-checkout", HomeController.previewCheckoutSubscription);
router.post("/change-package", HomeController.changeMerchantPackage);
router.post("/confirm-payment", HomeController.confirmMerchantSubscriptionPayment);

module.exports = router;

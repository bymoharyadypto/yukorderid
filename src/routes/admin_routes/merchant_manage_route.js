const router = require("express").Router();
const MerchantManageController = require("../../controllers/admin_controller/merchant_manage_controller");
const merchantProductManageRoute = require("./merchant_product_manage_route");
router.get("/list", MerchantManageController.getMerchantListWithPagination);
router.use("/product", merchantProductManageRoute);
// router.use("/:merchantId/product", merchantProductManageRoute);
router.get("/:merchantId/detail", MerchantManageController.getMerchantDetail);
router.put("/:merchantId/subscription", MerchantManageController.changeMerchantSubscription);
router.put("/:merchantId/subscription/expired-at", MerchantManageController.changeMerchantSubscriptionExpiredAt);

module.exports = router;

const router = require("express").Router();
const MerchantManageController = require("../../controllers/admin_controller/merchant_manage_controller");

router.get("/list", MerchantManageController.getMerchantListWithPagination);
router.get("/:merchantId/detail", MerchantManageController.getMerchantDetail);
router.put("/:merchantId/subscription", MerchantManageController.changeMerchantSubscription);
router.put("/:merchantId/subscription/expired-at", MerchantManageController.changeMerchantSubscriptionExpiredAt);

module.exports = router;

const router = require("express").Router();
const MerchantProductManageController = require("../../controllers/admin_controller/merchant_product_manage_controller");

router.get("/list", MerchantProductManageController.getMerchantProductList);
router.get("/:productId/detail", MerchantProductManageController.getMerchantProductDetail);
router.patch("/:productId/status", MerchantProductManageController.changeMerchantProductStatus);
router.patch("/:productId/delete", MerchantProductManageController.deleteMerchantProduct);

module.exports = router;

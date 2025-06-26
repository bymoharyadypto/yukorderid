const router = require("express").Router();
const MerchantProductManageController = require("../../controllers/admin_controller/merchant_product_manage_controller");

router.get("/list", MerchantProductManageController.getMerchantProductList);

module.exports = router;

const router = require("express").Router();
const PublicController = require("../../controllers/customer_controllers/public_controller");

router.get("/:subdomain/categories", PublicController.getAllCategories);
router.get("/:subdomain/products", PublicController.getProductsBySubdomain);
router.get("/:subdomain/merchant", PublicController.getMerchantBySubdomain);

module.exports = router;

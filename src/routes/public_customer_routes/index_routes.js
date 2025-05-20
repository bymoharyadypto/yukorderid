const router = require("express").Router();
const productRoutes = require("./product_routes");
const PublicController = require("../../controllers/customer_controllers/public_controller");

router.get("/:subdomain/categories", PublicController.getAllCategories);
router.get("/:subdomain/merchant", PublicController.getMerchantBySubdomain);
router.use("/:subdomain/products", productRoutes);


module.exports = router;

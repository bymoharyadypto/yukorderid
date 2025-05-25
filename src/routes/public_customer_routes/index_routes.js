const router = require("express").Router();
const { verifyToken } = require("../../middlewares/authentication");
const productRoutes = require("./product_routes");
const orderRoutes = require("./order_routes");
const PublicController = require("../../controllers/customer_controllers/public_controller");

router.get("/:subdomain/categories", PublicController.getAllCategories);
router.get("/:subdomain/merchant", PublicController.getMerchantBySubdomain);
router.use("/:subdomain/products", productRoutes);
router.use("/:subdomain/orders", verifyToken, orderRoutes);


module.exports = router;

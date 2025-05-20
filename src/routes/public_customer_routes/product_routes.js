const router = require("express").Router({ mergeParams: true });
const { verifyToken } = require("../../middlewares/authentication");
const PublicController = require("../../controllers/customer_controllers/public_controller");
const orderRoutes = require("./order_routes");

router.get('/', PublicController.getProductsBySubdomain);
router.use(verifyToken);
router.use('/orders', orderRoutes);

module.exports = router;

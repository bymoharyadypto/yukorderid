const router = require("express").Router({ mergeParams: true });
const OrderController = require("../../controllers/merchant_controllers/order_controller");

router.get("/", OrderController.getMerchantOrders);
router.get("/:orderId", OrderController.getMerchantOrderById);

module.exports = router;

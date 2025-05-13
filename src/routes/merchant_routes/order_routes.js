const router = require("express").Router({ mergeParams: true });
const OrderController = require("../../controllers/merchant_controllers/order_controller");

router.get("/", OrderController.getMerchantOrders);
router.get("/:orderId", OrderController.getMerchantOrderById);
router.post("/:orderId/process-order", OrderController.processCustomerOrderForMerchant);
router.post("/:orderId/input-order-shipping", OrderController.inputOrderShipping);

module.exports = router;

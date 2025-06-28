const router = require("express").Router();
const OrderController = require("../../controllers/customer_controllers/order_controller");
// router.post("/preview", OrderController.previewOrder);
// router.post("/", OrderController.createOrder);
router.get("/", OrderController.getCustomerOrders);
router.get("/:orderId", OrderController.getOrderDetails);
router.put("/:orderId", OrderController.confirmOrderDelivered);

module.exports = router;

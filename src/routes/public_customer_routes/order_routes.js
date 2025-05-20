const router = require("express").Router({ mergeParams: true });
const OrderController = require("../../controllers/customer_controllers/order_controller");

router.get("/", OrderController.getCustomerOrders);
router.post("/", OrderController.createOrder);

module.exports = router;
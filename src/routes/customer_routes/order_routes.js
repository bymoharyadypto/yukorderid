const router = require("express").Router();
const OrderController = require("../../controllers/customer_controllers/order_controller");

router.post("/", OrderController.createOrder);
router.get("/", OrderController.getCustomerOrders);


module.exports = router;

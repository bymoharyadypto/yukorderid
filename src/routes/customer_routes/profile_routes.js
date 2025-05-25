const router = require("express").Router();
const ProfileController = require("../../controllers/customer_controllers/profile_controller");
const OrderController = require("../../controllers/customer_controllers/order_controller");

const addressRoutes = require("./address_routes");
router.get("/", ProfileController.getUserCustomerProfile);
router.put("/", ProfileController.updateUserCustomerProfile);
router.use("/addresses", addressRoutes);
router.get("/orders", OrderController.getCustomerOrders);


module.exports = router;

const router = require("express").Router();
const { verifyToken } = require("../../middlewares/authentication");
const UserController = require("../../controllers/user_controllers/user_controller");
const orderRoutes = require("./order_routes");

router.use(verifyToken);
router.post("/register-customer", UserController.registerUserCustomer);
router.use("/orders", orderRoutes);

module.exports = router;

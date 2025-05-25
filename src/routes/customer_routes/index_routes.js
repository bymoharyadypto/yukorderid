const router = require("express").Router();
const { verifyToken } = require("../../middlewares/authentication");
const UserController = require("../../controllers/user_controllers/user_controller");
const orderRoutes = require("./order_routes");
const profileRoutes = require("./profile_routes");

router.use(verifyToken);
router.post("/register-customer", UserController.registerUserCustomer);
router.use("/profile", profileRoutes);
router.use("/orders", orderRoutes);

module.exports = router;

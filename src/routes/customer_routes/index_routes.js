const router = require("express").Router();
const { verifyToken } = require("../../middlewares/authentication");
const UserController = require("../../controllers/user_controllers/user_controller");


router.use(verifyToken);
router.post("/register-customer", UserController.registerUserCustomer);


module.exports = router;

const router = require("express").Router();
const UserController = require("../../controllers/user_controllers/user_controller")

router.post("/request", UserController.requestOtp);
router.post("/verify", UserController.verifyOtp);


module.exports = router;
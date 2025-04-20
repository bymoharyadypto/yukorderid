const router = require("express").Router();
const UserController = require("../../controllers/merchant_controller/user_controller");

router.get("/", UserController.getUserProfile);

module.exports = router;

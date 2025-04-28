const router = require("express").Router();
const UserController = require("../../controllers/user_controllers/user_controller");

router.get("/", UserController.getUserProfile);

module.exports = router;

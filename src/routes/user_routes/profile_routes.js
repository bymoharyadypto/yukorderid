const router = require("express").Router();
const UserController = require("../../controllers/user_controllers/user_controller");

router.get("/merchant", UserController.getUserMerchantProfile);
router.get("/customer", UserController.getUserCustomerProfile);

module.exports = router;

const router = require("express").Router();
const ProfileController = require("../../controllers/customer_controllers/profile_controller");

router.post("/", ProfileController.createCustomerAddress);
router.get("/", ProfileController.getCustomerAddressList);
router.get("/:addressId", ProfileController.getCustomerAddress);
router.put("/:addressId", ProfileController.updateCustomerAddress);
router.patch("/:addressId/primary", ProfileController.updateCustomerPrimaryAddress);

module.exports = router;

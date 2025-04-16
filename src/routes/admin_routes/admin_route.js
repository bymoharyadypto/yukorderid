const router = require("express").Router();
const adminController = require("../../controllers/admin_controller/admin_controller");

router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

module.exports = router;

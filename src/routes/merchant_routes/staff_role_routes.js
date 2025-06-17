const router = require("express").Router({ mergeParams: true });
const StaffRoleController = require("../../controllers/merchant_controllers/staff_role_controller");

router.post("/", StaffRoleController.createStaffRole);
router.get("/", StaffRoleController.getAllStaffRole);
router.get("/:staffRoleId", StaffRoleController.getStaffRoleById);
router.put("/:staffRoleId", StaffRoleController.updateStaffRole);
router.put("/:staffRoleId/status", StaffRoleController.updateStaffRoleStatus);

module.exports = router;

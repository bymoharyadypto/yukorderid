const router = require("express").Router({ mergeParams: true });
const staffRoleRoutes = require("./staff_role_routes");
const StaffController = require("../../controllers/merchant_controllers/staff_controller");
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');
const checkMerchantQuota = require('../../middlewares/checkMerchantQuota');

router.use("/role", checkMerchantFeature("Akun Staff"), staffRoleRoutes);

router.post("/", checkMerchantFeature("Akun Staff"), checkMerchantQuota("Akun Staff", "MerchantStaffs", { status: 'Active' }), StaffController.createMerchantStaff);
router.get("/", StaffController.getAllStaff);
router.get("/:staffId", StaffController.getStaffById);
router.put("/:staffId", StaffController.updateMerchantStaff);
router.patch("/:staffId", StaffController.updateMerchantStaffStatus);



module.exports = router;

const router = require("express").Router();
const DashboardController = require("../../controllers/admin_controller/dashboard_controller");

router.get("/summary", DashboardController.getAdminDashboardSummary);

module.exports = router;

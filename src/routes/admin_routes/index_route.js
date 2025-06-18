const router = require("express").Router();
const adminRoute = require("./admin_route");
const dashboardRoute = require("./dashboard_route");
const { verifyAdminToken } = require("../../middlewares/authentication");

router.use("/auth", adminRoute);
router.use(verifyAdminToken);
router.use("/dashboard", dashboardRoute);

module.exports = router;
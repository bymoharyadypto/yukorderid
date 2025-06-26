const router = require("express").Router();
const adminRoute = require("./admin_route");
const dashboardRoute = require("./dashboard_route");
const merchantManageRoute = require("./merchant_manage_controller");
const merchantProductManageRoute = require("./merchant_product_manage_controller");
const { verifyAdminToken } = require("../../middlewares/authentication");

router.use("/auth", adminRoute);
router.use(verifyAdminToken);
router.use("/dashboard", dashboardRoute);
router.use("/merchant", merchantManageRoute);
router.use("/merchant/product", merchantProductManageRoute);
module.exports = router;
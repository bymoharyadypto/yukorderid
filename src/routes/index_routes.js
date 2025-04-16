const router = require("express").Router();
const adminRoute = require("./admin_routes/index_route");
const merchantRoute = require("./merchant_routes/index_routes");

router.use("/admin", adminRoute);
router.use("/merchant", merchantRoute);

module.exports = router;

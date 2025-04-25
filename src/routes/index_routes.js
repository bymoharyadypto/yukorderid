const router = require("express").Router();
const adminRoute = require("./admin_routes/index_route");
const merchantRoute = require("./merchant_routes/index_routes");
const authRoutes = require("./auth_routes/index._routes");
const userRoutes = require("./user_routes/index_routes");
const customerRoutes = require("./customer_routes/index_routes");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoute);
router.use("/merchant", merchantRoute);
router.use("/customer", customerRoutes)

module.exports = router;

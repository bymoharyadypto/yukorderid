const router = require("express").Router();
const otpRoutes = require("./otp_routes");

router.use("/otp", otpRoutes);

module.exports = router;

const router = require("express").Router();
const adminRoute = require("./admin_route");

router.use("/", adminRoute);

module.exports = router;
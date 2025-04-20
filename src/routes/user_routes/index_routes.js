const router = require("express").Router();
const profileRoutes = require("./profile_routes");
const { verifyToken } = require("../../middlewares/authentication");

router.use(verifyToken);
router.use("/profile", profileRoutes);

module.exports = router;

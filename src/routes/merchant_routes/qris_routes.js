const router = require("express").Router({ mergeParams: true });
const QrisController = require("../../controllers/merchant_controllers/qris_controller");

router.post("/", QrisController.createMerchantQRIS);
router.get("/", QrisController.getAllQRISByMerchant);
router.get("/:qrisId", QrisController.getQRISById);

module.exports = router;

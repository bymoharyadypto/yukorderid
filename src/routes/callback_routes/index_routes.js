const router = require("express").Router();
const PaymentController = require("../../controllers/merchant_controllers/payment_controller");

router.post("/", PaymentController.handleMidtransCallback);

module.exports = router;

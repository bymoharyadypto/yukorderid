const router = require("express").Router({ mergeParams: true });
const ShippingRateController = require("../../controllers/merchant_controllers/shipping_rate_controller");

router.get("/", ShippingRateController.getMerchantShippingRates);
router.post("/", ShippingRateController.createMerchantShippingRates);
// router.get("/:shippingRateId", ShippingRateController.getShippingRate);
// router.put("/:shippingRateId", ShippingRateController.updateShippingRate);
// router.delete("/:shippingRateId", ShippingRateController.deleteShippingRate);

module.exports = router;

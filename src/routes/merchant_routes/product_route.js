const router = require("express").Router();
const ProductController = require("../../controllers/merchant_controller/product_controller")


router.post("/", ProductController.createMerchantProduct)
module.exports = router;
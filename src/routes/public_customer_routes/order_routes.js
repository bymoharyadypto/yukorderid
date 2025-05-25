const router = require("express").Router({ mergeParams: true });
const OrderController = require("../../controllers/customer_controllers/order_controller");
const PaymentMethodController = require("../../controllers/merchant_controllers/payment_method_controller");

router.get("/discounts", OrderController.getMerchantDiscounts);
router.get("/payment-methods", PaymentMethodController.getAllPaymentMethods);
router.post("/preview", OrderController.previewOrder);
router.post("/", OrderController.createOrder);
router.get("/", OrderController.getCustomerOrders);

module.exports = router;
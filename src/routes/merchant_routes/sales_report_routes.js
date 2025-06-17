const router = require("express").Router({ mergeParams: true });
const SalesReportController = require("../../controllers/merchant_controllers/sales_report_controller");

router.get("/net-sales-order-report", SalesReportController.getNetSalesOrderReport);
router.get("/total-orders-report", SalesReportController.getTotalOrdersReport);

module.exports = router;

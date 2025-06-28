const router = require("express").Router();
const CustomerManageController = require("../../controllers/admin_controller/customer_manage_controller");

router.get("/list", CustomerManageController.getCustomerListWithPagination);

module.exports = router;

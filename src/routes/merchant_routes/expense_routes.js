const router = require("express").Router({ mergeParams: true });
const expenseCategoryRoutes = require("./expense_category_routes");
const ExpenseController = require("../../controllers/merchant_controllers/expense_controller");
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');

router.use("/category", checkMerchantFeature("Expanse Management"), expenseCategoryRoutes);

router.post("/", checkMerchantFeature("Expanse Management"), ExpenseController.createExpense);
router.get("/", ExpenseController.getAllExpense);
router.put("/:expenseId", ExpenseController.updateExpense);

module.exports = router;

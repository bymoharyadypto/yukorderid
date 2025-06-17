const router = require("express").Router({ mergeParams: true });
const ExpenseCategoryController = require("../../controllers/merchant_controllers/expense_category_controller");

router.post("/", ExpenseCategoryController.createExpenseCategory);
router.get("/", ExpenseCategoryController.getExpenseCategories);
router.put("/:expenseCategoryId", ExpenseCategoryController.updateExpenseCategory);
router.put("/:expenseCategoryId/status", ExpenseCategoryController.updateExpenseCategoryStatus);

module.exports = router;

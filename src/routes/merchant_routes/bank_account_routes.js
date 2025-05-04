const router = require("express").Router({ mergeParams: true });
const MerchantBankAccountsController = require("../../controllers/merchant_controllers/bank_account_controller");

router.post("/", MerchantBankAccountsController.createMerchantBankAccount);
router.get("/", MerchantBankAccountsController.getAllMerchantBankAccounts);
router.get("/:bankAccountId", MerchantBankAccountsController.getMerchantBankAccountById);
module.exports = router;

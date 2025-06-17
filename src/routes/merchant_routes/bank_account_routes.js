const router = require("express").Router({ mergeParams: true });
const MerchantBankAccountsController = require("../../controllers/merchant_controllers/bank_account_controller");
const checkMerchantFeature = require('../../middlewares/checkMerchantFeature');
const checkMerchantQuota = require('../../middlewares/checkMerchantQuota');

router.post("/", checkMerchantFeature('Metode Pembayaran'), checkMerchantQuota('Metode Pembayaran', 'MerchantPaymentMethods', { deletedAt: null }), MerchantBankAccountsController.createMerchantBankAccount);
router.get("/", MerchantBankAccountsController.getAllMerchantBankAccounts);
router.get("/:bankAccountId", MerchantBankAccountsController.getMerchantBankAccountById);
module.exports = router;

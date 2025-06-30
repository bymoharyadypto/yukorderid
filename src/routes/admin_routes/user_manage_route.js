const router = require("express").Router();
const UserManageController = require("../../controllers/admin_controller/user_manage_controller");

router.get("/permissions-grouped", UserManageController.getPermissionsGrouped);
router.get("/roles", UserManageController.getRoles);
router.get("/roles-with-permissions", UserManageController.getRolesWithPermissions);
router.post("/role", UserManageController.createRole);
router.put("/role/:roleId", UserManageController.updateRolePermissions);

module.exports = router;

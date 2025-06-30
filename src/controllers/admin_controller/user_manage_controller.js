const db = require("../../models");
const { Op } = require("sequelize");

class UserManageController {
    static async getPermissionsGrouped(req, res) {
        try {
            console.log('getPermissionsGrouped');

            const permissions = await db.Permissions.findAll({
                attributes: ['id', 'key', 'description'],
            });

            const grouped = {};

            permissions.forEach(p => {
                const [group, action] = p.key.split('.');
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push({
                    id: p.id,
                    key: p.key,
                    action,
                    description: p.description
                });
            });

            return res.status(200).json(grouped);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getRolesWithPermissions(req, res) {
        try {
            const roles = await db.Roles.findAll({
                where: {
                    name: {
                        [Op.notIn]: ['merchant', 'customer', 'superadmin']
                    }
                },
                include: {
                    model: db.Permissions,
                    as: 'permissions',
                    through: { attributes: [] },
                    attributes: ['id', 'key']
                }
            });

            if (!roles || roles.length === 0) {
                return res.status(404).json({ message: 'No roles found' });
            }

            const permissions = await db.Permissions.findAll({
                attributes: ['id', 'key', 'description']
            });

            return res.status(200).json({ roles, permissions });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async createRole(req, res) {
        try {
            let { name } = req.body;

            if (!name || name.length < 3) {
                return res.status(400).json({ message: 'Invalid role name' });
            }

            name = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

            const [role, created] = await db.Roles.findOrCreate({
                where: { name }
            });

            if (!created) {
                return res.status(409).json({ message: 'Role already exists' });
            }

            return res.status(201).json(role);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getRoles(req, res) {
        try {
            const roles = await db.Roles.findAll({
                where: {
                    name: {
                        [Op.notIn]: ['merchant', 'customer', 'superadmin']
                    }
                },
            });

            if (!roles || roles.length === 0) {
                return res.status(404).json({ message: 'No roles found' });
            }

            return res.status(200).json(roles);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateRolePermissions(req, res) {
        try {
            const { roleId } = req.params;
            const { permissionKeys } = req.body; // example: ['user.create', 'product.delete']

            const role = await db.Roles.findByPk(roleId);
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }

            const allPermissions = await db.Permissions.findAll({
                where: { key: permissionKeys },
            });

            if (allPermissions.length !== permissionKeys.length) {
                return res.status(400).json({ message: 'Some permission keys are invalid' });
            }

            await db.RolePermission.destroy({ where: { roleId } });

            const newPermissions = allPermissions.map(p => ({
                roleId,
                permissionId: p.id
            }));

            await db.RolePermission.bulkCreate(newPermissions);

            return res.status(200).json({ message: 'Permissions updated successfully' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = UserManageController;
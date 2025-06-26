const { comparePassword } = require("../../helpers/bcrypt");
const db = require("../../models");
const { signAccessTokenForAdmin, signRefreshTokenForAdmin } = require("../../helpers/tokenHelper");
const dayjs = require("dayjs");
const { Op } = require("sequelize");
class AdminController {
  static async registerAdmin(req, res) {
    const { name, email, password, phoneNumber } = req.body;
    try {
      if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await db.Users.create({
        name,
        email,
        password,
        phoneNumber,
        role: "ADMIN",
      });
      const access_token = sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      res.status(201).json({
        message: "Success",
        data: {
          id: user.id,
          email: user.email,
          access_token,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async loginAdmin(req, res) {
    const transaction = await db.sequelize.transaction();
    const { email, password } = req.body;
    try {
      const user = await db.Users.findOne({
        where: { email },
        include: { model: db.Roles, as: 'role' }
      });

      if (!user) throw { status: 404, message: "User not found" };
      console.log(user.role.name);
      console.log(user);


      if (user.role.name !== 'admin' && user.role.name !== 'superadmin') throw { status: 403, message: "You are not allowed to login" };

      if (!comparePassword(password, user.password))
        throw { status: 401, name: "InvalidPassword" };

      const existingToken = await db.RefreshTokens.findOne({
        where: {
          userId: user.id,
          expiresAt: { [Op.gt]: new Date() }
        },
        order: [['createdAt', 'DESC']], transaction
      });

      if (existingToken) {
        await existingToken.destroy({ transaction });
      }

      const access_token = await signAccessTokenForAdmin(user, transaction);
      const refresh_token = await signRefreshTokenForAdmin(user, transaction);

      await db.RefreshTokens.create({
        userId: user.id,
        token: refresh_token,
        expiresAt: dayjs().add(7, 'days').toDate()
      }, { transaction });

      await transaction.commit();

      return res.status(200).json({ message: "Success", access_token, refresh_token });
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      return res.status(error.status || 500).send({ message: error.message || 'Internal server error' });
    }
  }
}

module.exports = AdminController;

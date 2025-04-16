const { sign } = require("../../helpers/jwt");
const { comparePassword } = require("../../helpers/bcrypt");
const { Users } = require("../../models");
class AdminController {
  static async registerAdmin(req, res) {
    const { name, email, password, phoneNumber } = req.body;
    try {
      if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await Users.create({
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
    const { email, password } = req.body;
    try {
      const user = await Users.findOne({
        attributes: { email, password },
        where: { email },
      });

      if (!user || !user.length) throw { message: "User not found" };
      if (!comparePassword(password, user.password))
        throw { name: "InvalidPassword" };
      const access_token = sign({
        id: user.id,
        email,
        name: user.name,
        role: user.role,
      });
      res.status(200).json({ access_token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = AdminController;

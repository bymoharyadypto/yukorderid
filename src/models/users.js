"use strict";
const { Model } = require("sequelize");
const { hashingPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.belongsTo(models.Roles, { foreignKey: 'roleId', as: 'role' });
      Users.hasMany(models.Merchants, { as: 'merchants', foreignKey: 'userId' })
      Users.hasOne(models.CustomerProfiles, { as: 'customerProfile', foreignKey: 'userId' });
      Users.hasMany(models.CustomerAddresses, { as: 'customerAddresses', foreignKey: 'userId' });
    }
  }
  Users.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        isEmail: true,
        unique: {
          msg: "Email sudah terdaftar",
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        unique: {
          msg: "Nomor telepon sudah terdaftar",
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [8, 60],
            msg: "Password must be between 8 and 60 characters long.",
          },
          // is: {
          //   args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          //   msg: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&).",
          // },
        },
      },
      repeatPassword: DataTypes.STRING,
      roleId: DataTypes.INTEGER,
      isVerified: DataTypes.BOOLEAN,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    // {
    //   sequelize,
    //   modelName: "Users",
    //   hooks: {
    //     beforeCreate: (instance, options) => {
    //       instance.password = hashingPassword(instance.password);
    //     },
    //   },
    // }
    {
      sequelize,
      modelName: "Users",
      hooks: {
        beforeCreate: (instance, options) => {
          if (instance.password) {
            instance.password = hashingPassword(instance.password);
          }
        },
      },
    }
  );
  return Users;
};

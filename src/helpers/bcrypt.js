const bcrypt = require("bcryptjs");

function hashingPassword(pass) {
  return bcrypt.hashSync(pass, 10);
}

function comparePassword(pass, hashPass) {
  return bcrypt.compareSync(pass, hashPass);
}

module.exports = {
  hashingPassword,
  comparePassword,
};

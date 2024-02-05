const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const SALT_ROUNDS = 10;

userSchema.pre("save", async function (next) {
  try {
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (password) {
  const user = this;
  try {
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      throw new Error("Contraseña incorrecta");
    }
    return compare;
  } catch (error) {
    throw error;
  }
};

userSchema.methods.toJSON = function () {
  try {
    const user = this.toObject();
    delete user.password;
    return user;
  } catch (error) {
    console.error("Error al convertir a JSON:", error.message);
    return this.toObject();
  }
};

userSchema.methods.toPublicJSON = userSchema.methods.toJSON;

const User = mongoose.model("User", userSchema);

module.exports = User;

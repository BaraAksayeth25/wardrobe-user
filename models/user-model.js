const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    maxLength: 255,
  },
  name: {
    type: String,
    maxLength: 255,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    maxLength: 255,
  },
  profilePict: {
    type: String,
    default: process.env.PROFILE_PICT,
  },
});

module.exports = mongoose.model("user", userSchema);

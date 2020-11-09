const mongoose = require("mongoose");

const registSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    maxLength: 255,
  },
  name: {
    type: String,
    required: true,
    maxLength: 255,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    maxLength: 15,
  },
  tokenActivation: {
    type: String,
    unique: true,
  },
  tokenExpired: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 3600 * 1000),
  },
  createdAt: {
    type: Date,
    default: () => +new Date(),
    index: {
      expires: "1d",
    },
  },
});

module.exports = mongoose.model("registation", registSchema);

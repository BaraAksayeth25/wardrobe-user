const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    maxlength: 255,
    required: true,
  },
  role: {
    type: String,
    enum: ["Cashier", "Admin"],
    required: true,
  },
});

module.exports = mongoose.model("admin", adminSchema);

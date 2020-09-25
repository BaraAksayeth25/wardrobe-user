const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: 255,
    required: true,
  },
});

module.exports = mongoose.model("category", categorySchema);

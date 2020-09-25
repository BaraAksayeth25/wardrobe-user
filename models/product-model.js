const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 255,
    required: true,
  },
  description: {
    type: String,
  },
  stock: {
    type: Number,
    min: 0,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  image: {
    type: String,
    default: process.env.DEFAULT_IMAGES_PRODUCT,
  },
});

module.exports = mongoose.model("product", productSchema);

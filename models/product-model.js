const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 255,
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "category",
    required: true,
  },
  description: {
    type: String,
  },
  stocks: [
    {
      size: {
        type: String,
      },
      stock: {
        type: Number,
        min: 0,
        required: true,
      },
      _id: false,
    },
  ],
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  image: {
    type: String,
    default: process.env.DEFAULT_IMAGE_PRODUCT,
  },
});

module.exports = mongoose.model("product", productSchema);

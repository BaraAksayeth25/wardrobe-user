const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    maxLength: 255,
    required: true,
  },
  total_price: {
    type: Number,
    min: 0,
    required: true,
  },
  products: [
    {
      _id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "product",
      },
      size: {
        type: String,
      },
      stock: {
        type: Number,
        min: 1,
      },
    },
  ],
  date: {
    type: Date,
    default: () => +new Date() + 1000,
  },
  day: {
    type: Number,
    min: 0,
  },
  overDue: {
    type: Date,
  },
});

module.exports = mongoose.model("order", orderSchema);

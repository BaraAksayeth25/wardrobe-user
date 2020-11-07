const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  bookingCode: {
    type: String,
    unique: true,
    maxlength: 255,
  },
  email: {
    type: String,
    maxLength: 255,
    required: true,
    ref: "user",
  },
  totalPrice: {
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
    required: true,
  },
  days: {
    type: Number,
    min: 0,
    required: true,
  },
  overDue: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "Waiting For Payment",
  },
  createdAt: {
    type: Date,
    default: () => +new Date(),
    index: {
      expires: "2d",
    },
  },
});

module.exports = mongoose.model("transaction", transactionSchema);

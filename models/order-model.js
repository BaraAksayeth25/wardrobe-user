const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      maxLength: 255,
      required: true,
    },
    bookingCode: {
      type: String,
      maxLength: 255,
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
    },
    days: {
      type: Number,
      min: 1,
    },
    overDue: {
      type: Date,
    },
    status: {
      type: String,
      default: "On Going",
    },
    cashier: {
      type: String,
      required: true,
    },
    finishedAt: {
      type: Date,
    },
    fine: {
      type: Number,
      min: 0,
    },
    late: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", orderSchema);

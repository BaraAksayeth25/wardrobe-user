const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: {
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
        ref: "Owner",
      },
    },
  ],
});

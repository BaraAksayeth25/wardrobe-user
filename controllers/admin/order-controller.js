const { countDays } = require("../../helpers/date");
const HttpError = require("../../models/http-error");
const OrderModel = require("../../models/order-model");
const ProductModel = require("../../models/product-model");

const getOrderOnGoingAdmin = async (req, res, next) => {
  const pages = parseInt(req.params.pages) || 1;
  const skipDocument = pages <= 1 ? 0 : pages * 10 - 10;
  const limitDocument = 10;

  let order;
  try {
    order = await OrderModel.find({ status: "On Going" })
      .limit(limitDocument)
      .skip(skipDocument);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: order });
};

const getOrderFinishedAdmin = async (req, res, next) => {
  const pages = parseInt(req.params.pages) || 1;
  const skipDocument = pages <= 1 ? 0 : pages * 10 - 10;
  const limitDocument = 10;

  let order;
  try {
    order = await OrderModel.find({ status: "Finished" })
      .limit(limitDocument)
      .skip(skipDocument);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: order });
};

const getOrderByBookingCodeAdmin = async (req, res, next) => {
  const code = req.params.code;

  let order;
  try {
    order = await OrderModel.findOne({ bookingCode: code }).populate(
      "products._id"
    );
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  res.json({ message: "OK", data: order });
};

const finishingOrderAdmin = async (req, res, next) => {
  const bookingCode = req.params.code;
  const now = new Date();

  let order;
  try {
    order = await OrderModel.findOne({ bookingCode, status: "On Going" });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!order) {
    return next(new HttpError("Order not found", 404));
  }
  const { products: productsOrder, overDue, totalPrice } = order;

  const late = countDays(overDue, now);
  const fine = (late * totalPrice) / 2;

  order.fine = fine;
  order.late = late;
  order.finishedAt = now;
  order.status = "Finished";

  try {
    await order.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  for (const product of productsOrder) {
    try {
      await ProductModel.updateOne(
        { _id: product._id },
        { $inc: { "stocks.$[elem].stock": product.stock } },
        { arrayFilters: [{ "elem.size": product.size }] }
      );
    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
  }
  res.json({ message: "OK", invoice: order });
};

module.exports = {
  getOrderByBookingCodeAdmin,
  getOrderFinishedAdmin,
  getOrderOnGoingAdmin,
  finishingOrderAdmin,
};

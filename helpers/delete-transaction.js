const TransactionModel = require("../models/transaction-model");
const ProductModel = require("../models/product-model");

const main = async () => {
  let transactions;
  try {
    transactions = await TransactionModel.find({
      expires: { $lt: new Date() },
    }).limit(10);
    // Update Stock produk
    for (const transaction of transactions) {
      for (const product of transaction.products) {
        const updateProduct = await ProductModel.updateOne(
          { _id: product.id },
          { $inc: { "stocks.$[elem].stock": product.stock } },
          { arrayFilters: [{ "elem.size": product.size }] }
        );
        console.log(updateProduct);
      }
      await TransactionModel.deleteOne({ _id: transaction._id });
    }
  } catch (err) {
    process.exit(0);
  }
};

module.exports = main;

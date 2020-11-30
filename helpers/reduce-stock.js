const reduceSameStocks = (stocks) => {
  const stockReduce = [];
  stockReduce.push(stocks[0]);

  for (let i = 1; i < stocks.length; i++) {
    // Mencari index produk dengan stock dan size yang sama
    const sameStock = stockReduce.findIndex(
      (stock) => stock._id === stocks[i]._id && stock.size === stocks[i].size
    );

    // Jika berhasil ditemukan tambahkan stock lama dengan stock baru
    // Jika tidak masukkan product ke dalam array
    sameStock !== undefined && sameStock !== -1
      ? (stockReduce[sameStock].stock += stocks[i].stock)
      : stockReduce.push(stocks[i]);
  }
  return stockReduce;
};

module.exports = reduceSameStocks;

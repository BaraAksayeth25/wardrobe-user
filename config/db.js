let db_url =
  process.env.NODE_SERVER === "DEVELOPMENT"
    ? "mongodb://localhost:27017/wardrobe-user"
    : "mongodbatlas connection";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = { db_url, options };

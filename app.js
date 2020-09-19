const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Import the router
const productRoute = require("./routes/product-route");
const categoryRoute = require("./routes/category-route");
const userRoute = require("./routes/user-route");

const app = express();
const PORT = process.env.PORT || 8080;

// Set Middlewares
app.use(bodyParser.json());

// Set Routes
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/user", userRoute);

// Run server
app.listen(PORT, () => console.log(`Server Running in ${PORT}`));

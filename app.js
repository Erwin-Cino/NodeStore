const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

connectDB();

app.use(cors());

app.use(morgan("dev"));
app.use(express.json({ extended: false }));

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
module.exports = app;

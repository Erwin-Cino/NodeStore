const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");

router.get("/", async (req, res, next) => {
  try {
    const allProducts = await Product.find();
    return res.status(200).json({ allProducts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res, next) => {
  const { name, price } = req.body;

  try {
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name,
      price
    });

    product.save();

    return res.status(201).json({
      message: "Handling post request on products api",
      product: product
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    } else {
      return res.status(200).json({ product });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  const { name, price } = req.body;
  const productFields = {};
  if (name) productFields.name = name;
  if (price) productFields.price = price;

  try {
    let product = await Product.findById(id);
    if (product)
      product = await Product.findOneAndUpdate(
        { _id: id },
        {
          $set: productFields
        },
        { new: true }
      );
    return res.json({ product });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Server Error");
  }
});

router.delete("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  try {
    const deletedProduct = await Product.remove({ _id: id });

    if (deletedProduct) {
      return res.status(200).json({ deletedProduct });
    } else {
      return res.status(500).json({ message: "No product found with that ID" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
module.exports = router;

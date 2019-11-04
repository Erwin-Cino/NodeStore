const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  //accept a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    //rejecting
    cb(null, true);
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

router.get("/", async (req, res, next) => {
  try {
    const allProducts = await Product.find().select(
      "name price _id productImage"
    );
    const response = {
      count: allProducts.length,
      products: allProducts.map(doc => {
        return {
          id: doc._id,
          name: doc.name,
          price: doc.price,
          productImage: doc.productImage,
          request: {
            type: "GET",
            url: "http://localhost:5000/products/" + doc._id
          }
        };
      })
    };
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post(
  "/",
  checkAuth,
  upload.single("productImage"),
  [
    check("name", "Name of the product is required")
      .not()
      .isEmpty(),
    check("price", "Please add a price to the product")
      .not()
      .isEmpty()
  ],
  async (req, res, next) => {
    const { name, price } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log(req.file);

    try {
      const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name,
        price,
        productImage: req.file.path
      });

      product.save();

      return res.status(201).json({
        message: "Created product successfully",
        product: {
          name: product.name,
          price: product.price,
          productImage: product.productImage,
          id: product._id,
          request: {
            type: "GET",
            url: "http://localhost:5000/products/" + product._id
          }
        }
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
);

router.get("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  try {
    const product = await Product.findById(id).select(
      "name price _id productImage"
    );
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

router.patch("/:productId", checkAuth, async (req, res, next) => {
  const id = req.params.productId;
  const { name, price } = req.body;
  const productFields = {};
  if (name) productFields.name = name;
  if (price) productFields.price = price;
  //   const updateOps = {};
  //   for (const ops of Object.keys(req.body)) {
  //     updateOps[ops.propName] = ops.value;
  //   }

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

router.delete("/:productId", checkAuth, async (req, res, next) => {
  const id = req.params.productId;
  try {
    const deletedProduct = await Product.remove({ _id: id });

    return res.status(200).json({
      message: "Product Deleted",
      requst: {
        type: "POST",
        url: "http:localhost:5000/products",
        data: {
          name: "String",
          price: "Number"
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
module.exports = router;

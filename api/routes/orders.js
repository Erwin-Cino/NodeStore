const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const allOrders = await Order.find()
      .select("product quantity _id")
      .populate("product", "name");
    return res.status(200).json({
      count: allOrders.length,
      order: allOrders.map(orders => {
        return {
          _id: orders.id,
          product: orders.product,
          quantity: orders.quantity,
          request: {
            type: "GET",
            url: "http://localhost:5000/orders/" + orders.id
          }
        };
      })
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res, next) => {
  const { quantity, productId } = req.body;
  try {
    const findProd = Product.findById(productId);

    if (findProd) {
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: quantity,
        product: productId
      });

      await order.save();

      console.log(order);
      return res.status(201).json({
        message: "Order stored",
        requrest: {
          type: "POST",
          createdOrder: {
            id: order._id,
            product: order.product,
            quantity: order.quantity
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:orderId", async (req, res, next) => {
  // 201 everything was created!
  const id = req.params.orderId;

  try {
    const foundOrder = await Order.findById(id).select("quantity _id product");
    return res.status(200).json({
      message: "Order details",
      order: foundOrder,
      request: {
        type: "GET",
        url: "http://localhost:5000/orders"
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

router.delete("/:orderId", async (req, res, next) => {
  const id = req.params.orderId;
  try {
    const foundOrder = await Order.findById(id);
    console.log(foundOrder);

    if (!foundOrder) {
      res.status(404).json({
        message: "Order not found"
      });
    } else {
      await Order.findOneAndRemove({ _id: id });
      return res.status(200).json({
        message: "Order deleted",
        request: {
          type: "POST",
          url: "http://localhost:5000/orders"
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});
module.exports = router;

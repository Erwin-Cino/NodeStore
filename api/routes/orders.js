const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Orders were fetched"
  });
});

router.post("/", (req, res, next) => {
  // 201 everything was created!
  res.status(201).json({
    message: "Orders were created"
  });
});

router.get("/:orderId", (req, res, next) => {
  // 201 everything was created!
  res.status(200).json({
    message: "Order details",
    orderId: req.params.orderId
  });
});
module.exports = router;

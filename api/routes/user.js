const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

router.post(
  "/signup",
  [
    (check("email", "Email is required").not().isEmpty,
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        _id: new mongoose.Types.ObjectId(),
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      return res.status(200).json({
        message: "User created!"
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

module.exports = router;

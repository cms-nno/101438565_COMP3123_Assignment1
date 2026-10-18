const express = require("express");
const { body } = require("express-validator");
const { signup } = require("../controllers/userController");

const router = express.Router();

router.post(
  "/signup",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required"),

    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => err.msg),
      });
    }

    next();
  },
  signup
);

module.exports = router;
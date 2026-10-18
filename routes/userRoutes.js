
const express = require("express");
const { body, validationResult } = require("express-validator");
const { signup, login } = require("../controllers/userController");

const router = express.Router();

// Reusable validation error handler
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => err.msg),
    });
  }

  next();
};

// POST /api/v1/user/signup
router.post(
  "/signup",
  [
    body("username")
      .isString()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),

    body("email")
      .isString()
      .trim()
      .isEmail()
      .withMessage("A valid email is required"),

    body("password")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  checkValidation,
  signup
);

// POST /api/v1/user/login
router.post(
  "/login",
  [
    body("password")
      .isString()
      .notEmpty()
      .withMessage("Password is required"),

    body().custom((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Request body must be a JSON object");
      }

      if (
        typeof value.username !== "string" &&
        typeof value.email !== "string"
      ) {
        throw new Error("Username or email is required");
      }

      if (
        (typeof value.username === "string" && !value.username.trim()) ||
        (typeof value.email === "string" && !value.email.trim())
      ) {
        throw new Error("Username or email cannot be empty");
      }

      return true;
    }),
  ],
  checkValidation,
  login
);

module.exports = router;

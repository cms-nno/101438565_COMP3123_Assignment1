
const express = require("express");
const { body, validationResult } = require("express-validator");
const { signup, login } = require("../controllers/userController");

const router = express.Router();

// Return consistent, useful validation errors.
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// Validate that the request body is a JSON object.
const validateRequestBody = (req, res, next) => {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      message: "Request body must be a JSON object",
    });
  }

  next();
};

// POST /api/v1/user/signup
router.post(
  "/signup",
  validateRequestBody,
  [
    body("username")
      .exists({ checkFalsy: true })
      .withMessage("Username is required")
      .bail()
      .isString()
      .withMessage("Username must be a string")
      .bail()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage(
        "Username may contain only letters, numbers, underscores, dots, and hyphens"
      ),

    body("email")
      .exists({ checkFalsy: true })
      .withMessage("Email is required")
      .bail()
      .isString()
      .withMessage("Email must be a string")
      .bail()
      .trim()
      .isLength({ max: 254 })
      .withMessage("Email cannot exceed 254 characters")
      .bail()
      .isEmail()
      .withMessage("A valid email is required")
      .normalizeEmail(),

    body("password")
      .exists()
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters")
      .custom((password) => {
        if (password.trim().length === 0) {
          throw new Error("Password cannot be empty");
        }

        return true;
      }),
  ],
  checkValidation,
  signup
);

// POST /api/v1/user/login
router.post(
  "/login",
  validateRequestBody,
  [
    body("password")
      .exists()
      .withMessage("Password is required")
      .bail()
      .isString()
      .withMessage("Password must be a string")
      .bail()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .bail()
      .isLength({ max: 72 })
      .withMessage("Password cannot exceed 72 characters"),

    body().custom((value) => {
      const hasUsername =
        typeof value.username === "string" &&
        value.username.trim().length > 0;

      const hasEmail =
        typeof value.email === "string" &&
        value.email.trim().length > 0;

      if (!hasUsername && !hasEmail) {
        throw new Error("Username or email is required");
      }

      if (
        value.username !== undefined &&
        typeof value.username !== "string"
      ) {
        throw new Error("Username must be a string");
      }

      if (
        value.email !== undefined &&
        typeof value.email !== "string"
      ) {
        throw new Error("Email must be a string");
      }

      if (hasUsername && value.username.trim().length > 30) {
        throw new Error("Username cannot exceed 30 characters");
      }

      if (hasEmail) {
        if (value.email.trim().length > 254) {
          throw new Error("Email cannot exceed 254 characters");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
          throw new Error("A valid email is required");
        }
      }

      return true;
    }),
  ],
  checkValidation,
  login
);

module.exports = router;

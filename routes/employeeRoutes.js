
const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const authenticateToken = require("../middleware/auth");

const {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const router = express.Router();

const allowedFields = [
  "first_name",
  "last_name",
  "email",
  "position",
  "salary",
  "date_of_joining",
  "department",
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

// Reject non-object request bodies and unexpected fields.
const checkBodyObject = (req, res, next) => {
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

const checkAllowedFields = (req, res, next) => {
  const unexpectedFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      message: "Unexpected or prohibited fields",
      errors: unexpectedFields.map((field) => ({
        field,
        message: `Field '${field}' is not allowed`,
      })),
    });
  }

  next();
};

const validateEmployee = [
  body("first_name")
    .exists().withMessage("First name is required")
    .bail()
    .isString().withMessage("First name must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),

  body("last_name")
    .exists().withMessage("Last name is required")
    .bail()
    .isString().withMessage("Last name must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),

  body("email")
    .exists().withMessage("Email is required")
    .bail()
    .isString().withMessage("Email must be a string")
    .bail()
    .trim()
    .isLength({ max: 254 }).withMessage("Email cannot exceed 254 characters")
    .bail()
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail(),

  body("position")
    .exists().withMessage("Position is required")
    .bail()
    .isString().withMessage("Position must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("Position is required")
    .isLength({ max: 100 }).withMessage("Position cannot exceed 100 characters"),

  body("salary")
    .exists().withMessage("Salary is required")
    .bail()
    .isFloat({ min: 0 }).withMessage("Salary must be a non-negative number")
    .toFloat(),

  body("date_of_joining")
    .exists().withMessage("Date of joining is required")
    .bail()
    .isISO8601({ strict: true }).withMessage("A valid date is required (YYYY-MM-DD)")
    .toDate(),

  body("department")
    .exists().withMessage("Department is required")
    .bail()
    .isString().withMessage("Department must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("Department is required")
    .isLength({ max: 100 }).withMessage("Department cannot exceed 100 characters"),
];

const validateEmployeeUpdate = [
  body("first_name")
    .optional()
    .isString().withMessage("First name must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("First name cannot be empty")
    .isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),

  body("last_name")
    .optional()
    .isString().withMessage("Last name must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("Last name cannot be empty")
    .isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),

  body("email")
    .optional()
    .isString().withMessage("Email must be a string")
    .bail()
    .trim()
    .isLength({ max: 254 }).withMessage("Email cannot exceed 254 characters")
    .bail()
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail(),

  body("position")
    .optional()
    .isString().withMessage("Position must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("Position cannot be empty")
    .isLength({ max: 100 }).withMessage("Position cannot exceed 100 characters"),

  body("salary")
    .optional()
    .isFloat({ min: 0 }).withMessage("Salary must be a non-negative number")
    .toFloat(),

  body("date_of_joining")
    .optional()
    .isISO8601({ strict: true }).withMessage("A valid date is required (YYYY-MM-DD)")
    .toDate(),

  body("department")
    .optional()
    .isString().withMessage("Department must be a string")
    .bail()
    .trim()
    .notEmpty().withMessage("Department cannot be empty")
    .isLength({ max: 100 }).withMessage("Department cannot exceed 100 characters"),
];

const validateEmployeeId = [
  param("eid")
    .exists().withMessage("Employee ID is required")
    .bail()
    .custom((eid) => mongoose.isValidObjectId(eid))
    .withMessage("Invalid employee ID"),
];

const validateDeleteId = [
  query("eid")
    .exists().withMessage("Employee ID is required")
    .bail()
    .custom((eid) => mongoose.isValidObjectId(eid))
    .withMessage("Invalid employee ID"),
];

// All employee endpoints require a valid JWT.
router.use(authenticateToken);

router.get("/employees", listEmployees);

router.post(
  "/employees",
  checkBodyObject,
  checkAllowedFields,
  validateEmployee,
  checkValidation,
  createEmployee
);

router.get(
  "/employees/:eid",
  validateEmployeeId,
  checkValidation,
  getEmployee
);

router.put(
  "/employees/:eid",
  checkBodyObject,
  checkAllowedFields,
  validateEmployeeUpdate,
  checkValidation,
  validateEmployeeId,
  checkValidation,
  updateEmployee
);

router.delete(
  "/employees",
  validateDeleteId,
  checkValidation,
  deleteEmployee
);

module.exports = router;

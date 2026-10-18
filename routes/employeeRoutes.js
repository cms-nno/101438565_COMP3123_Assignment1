
const express = require("express");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");

const {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const router = express.Router();

const validateEmployee = [
  body("first_name")
    .isString().withMessage("First name must be a string")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),

  body("last_name")
    .isString().withMessage("Last name must be a string")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),

  body("email")
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail(),

  body("position")
    .isString().withMessage("Position must be a string")
    .trim()
    .notEmpty().withMessage("Position is required"),

  body("salary")
    .isFloat({ min: 0 }).withMessage("Salary must be non-negative")
    .toFloat(),

  body("date_of_joining")
    .isISO8601().withMessage("A valid joining date is required")
    .toDate(),

  body("department")
    .isString().withMessage("Department must be a string")
    .trim()
    .notEmpty().withMessage("Department is required"),
];

const validateEmployeeUpdate = [
  body("first_name")
    .optional()
    .isString().withMessage("First name must be a string")
    .trim()
    .notEmpty().withMessage("First name cannot be empty")
    .isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),

  body("last_name")
    .optional()
    .isString().withMessage("Last name must be a string")
    .trim()
    .notEmpty().withMessage("Last name cannot be empty")
    .isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),

  body("email")
    .optional()
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail(),

  body("position")
    .optional()
    .isString().withMessage("Position must be a string")
    .trim()
    .notEmpty().withMessage("Position cannot be empty"),

  body("salary")
    .optional()
    .isFloat({ min: 0 }).withMessage("Salary must be non-negative")
    .toFloat(),

  body("date_of_joining")
    .optional()
    .isISO8601().withMessage("A valid joining date is required")
    .toDate(),

  body("department")
    .optional()
    .isString().withMessage("Department must be a string")
    .trim()
    .notEmpty().withMessage("Department cannot be empty"),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => error.msg),
    });
  }

  next();
};

// Protect every employee endpoint with JWT authentication.
router.use(authenticateToken);

router.get("/employees", listEmployees);

router.post(
  "/employees",
  validateEmployee,
  checkValidation,
  createEmployee
);

router.get("/employees/:eid", getEmployee);

router.put(
  "/employees/:eid",
  validateEmployeeUpdate,
  checkValidation,
  updateEmployee
);

router.delete("/employees", deleteEmployee);

module.exports = router;

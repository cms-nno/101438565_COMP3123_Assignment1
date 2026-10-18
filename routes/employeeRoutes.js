
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
  body("first_name").isString().trim().notEmpty().withMessage("First name is required"),
  body("last_name").isString().trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("position").isString().trim().notEmpty().withMessage("Position is required"),
  body("salary").isFloat({ min: 0 }).withMessage("Salary must be non-negative"),
  body("date_of_joining").isISO8601().withMessage("A valid joining date is required"),
  body("department").isString().trim().notEmpty().withMessage("Department is required"),
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
  validateEmployee,
  checkValidation,
  updateEmployee
);

router.delete("/employees", deleteEmployee);

module.exports = router;


const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const ALLOWED_EMPLOYEE_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "position",
  "salary",
  "date_of_joining",
  "department",
];

// Centralized employee-controller error handling.
const sendEmployeeError = (res, error, operation) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(error.errors).map(
        (item) => item.message
      ),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid field value",
    });
  }

  console.error(`${operation} error:`, error.message);

  return res.status(500).json({
    message: "Internal server error",
  });
};

// GET /api/v1/emp/employees
// Return only employees owned by the authenticated user.
const listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      user: req.user.id,
    });

    return res.status(200).json(employees);
  } catch (error) {
    return sendEmployeeError(res, error, "List employees");
  }
};

// POST /api/v1/emp/employees
// Assign ownership using the authenticated user's identity.
const createEmployee = async (req, res) => {
  try {
    const employeeData = {};

    for (const field of ALLOWED_EMPLOYEE_FIELDS) {
      if (
        Object.prototype.hasOwnProperty.call(req.body, field)
      ) {
        employeeData[field] = req.body[field];
      }
    }

    const employee = new Employee({
      ...employeeData,
      user: req.user.id,
    });

    await employee.save();

    return res.status(201).json(employee);
  } catch (error) {
    return sendEmployeeError(res, error, "Create employee");
  }
};

// GET /api/v1/emp/employees/:eid
// Retrieve an employee only if the authenticated user owns it.
const getEmployee = async (req, res) => {
  try {
    const { eid } = req.params;

    if (!mongoose.isValidObjectId(eid)) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    const employee = await Employee.findOne({
      _id: eid,
      user: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(200).json(employee);
  } catch (error) {
    return sendEmployeeError(res, error, "Get employee");
  }
};

// PUT /api/v1/emp/employees/:eid
// Update permitted fields only, and only for an owned employee.
const updateEmployee = async (req, res) => {
  try {
    const { eid } = req.params;

    if (!mongoose.isValidObjectId(eid)) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    const updates = {};

    for (const field of ALLOWED_EMPLOYEE_FIELDS) {
      if (
        Object.prototype.hasOwnProperty.call(req.body, field)
      ) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid employee fields provided for update",
      });
    }

    const employee = await Employee.findOneAndUpdate(
      {
        _id: eid,
        user: req.user.id,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(200).json(employee);
  } catch (error) {
    return sendEmployeeError(res, error, "Update employee");
  }
};

// DELETE /api/v1/emp/employees?eid=xxx
// Delete only if the authenticated user owns the employee.
const deleteEmployee = async (req, res) => {
  try {
    const { eid } = req.query;

    if (
      typeof eid !== "string" ||
      !mongoose.isValidObjectId(eid)
    ) {
      return res.status(400).json({
        message: "A valid employee ID is required",
      });
    }

    const employee = await Employee.findOneAndDelete({
      _id: eid,
      user: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    return sendEmployeeError(res, error, "Delete employee");
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};

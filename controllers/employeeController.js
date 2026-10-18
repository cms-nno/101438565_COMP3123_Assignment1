
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

// GET /api/v1/emp/employees
// Return only employees owned by the authenticated user.
const listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      user: req.user.id,
    });

    return res.status(200).json(employees);
  } catch (error) {
    console.error("List employees error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// POST /api/v1/emp/employees
// Always assign ownership from the authenticated user's identity.
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
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
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
    console.error("Get employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
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
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Update employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE /api/v1/emp/employees?eid=xxx
// Delete only if the authenticated user owns the employee.
const deleteEmployee = async (req, res) => {
  try {
    const { eid } = req.query;

    if (!eid || !mongoose.isValidObjectId(eid)) {
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
    console.error("Delete employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};

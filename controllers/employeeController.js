const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user.id });

    return res.status(200).json(employees);
  } catch (error) {
    console.error("List employees error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createEmployee = async (req, res) => {
  try {
    const employee = new Employee({
      ...req.body,
      user: req.user.id,
    });

    await employee.save();

    return res.status(201).json(employee);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Create employee error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getEmployee = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eid)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findOne({
      _id: req.params.eid,
      user: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error("Get employee error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eid)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // Never allow the client to change employee ownership.
    const updates = { ...req.body };
    delete updates.user;
    delete updates._id;
    delete updates.created_at;
    delete updates.updated_at;

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.eid, user: req.user.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Update employee error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { eid } = req.query;

    if (!eid || !mongoose.isValidObjectId(eid)) {
      return res.status(400).json({ message: "A valid employee ID is required" });
    }

    const employee = await Employee.findOneAndDelete({
      _id: eid,
      user: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete employee error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
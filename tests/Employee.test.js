require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");

const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const username = `emp_test_${id}`.slice(0, 30);
const userEmail = `emp_owner_${id}@example.com`;
const employeeEmail = `employee_${id}@example.com`;

let ownerId;

const validEmployee = () => ({
  first_name: "John",
  last_name: "Smith",
  email: employeeEmail,
  position: "Developer",
  salary: 65000,
  date_of_joining: new Date("2026-01-15"),
  department: "IT",
  user: ownerId,
});

describe("Employee Model Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const owner = await User.create({
      username,
      email: userEmail,
      password: "TestPass123!",
    });

    ownerId = owner._id;
  });

  afterAll(async () => {
    try {
      if (ownerId) {
        await Employee.deleteMany({ user: ownerId });
        await User.deleteOne({ _id: ownerId });
      }
    } finally {
      await mongoose.disconnect();
    }
  });

  test("creates an employee with an owner", async () => {
    const employee = await Employee.create(validEmployee());

    expect(employee._id).toBeDefined();
    expect(employee.user.toString()).toBe(ownerId.toString());
  });

  test("maintains created_at and updated_at timestamps", async () => {
    const employee = await Employee.create(validEmployee());

    expect(employee.created_at).toBeInstanceOf(Date);
    expect(employee.updated_at).toBeInstanceOf(Date);
  });

  test("rejects an employee without an owner", async () => {
    const data = validEmployee();
    delete data.user;

    const employee = new Employee(data);

    await expect(employee.validate()).rejects.toHaveProperty(
      "errors.user"
    );
  });

  test("rejects an invalid email", async () => {
    const employee = new Employee({
      ...validEmployee(),
      email: "not-an-email",
    });

    await expect(employee.validate()).rejects.toHaveProperty(
      "errors.email"
    );
  });

  test("rejects a negative salary", async () => {
    const employee = new Employee({
      ...validEmployee(),
      salary: -100,
    });

    await expect(employee.validate()).rejects.toHaveProperty(
      "errors.salary"
    );
  });

  test("rejects a nonexistent owner", async () => {
    const data = validEmployee();
    data.user = new mongoose.Types.ObjectId();

    const employee = new Employee(data);

    await expect(employee.validate()).rejects.toHaveProperty(
      "errors.user"
    );
  });

  test("rejects an employee without a first name", async () => {
    const data = validEmployee();
    delete data.first_name;

    const employee = new Employee(data);

    await expect(employee.validate()).rejects.toHaveProperty(
      "errors.first_name"
    );
  });
});
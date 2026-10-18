require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const username = `t${id}`.slice(0, 30);
const email = `test_${id}@example.com`;
const password = "TestPass123!";

describe("User Model Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.init();
  });

  afterAll(async () => {
    try {
      await User.deleteMany({
        username: { $in: [username, `invalid_${id}`, `short_${id}`, `other_${id}`] },
      });
      await User.deleteMany({
        email: { $in: [email, `other_${id}@example.com`, `short_${id}@example.com`] },
      });
    } finally {
      await mongoose.disconnect();
    }
  });

  test("saves a user and hashes the password", async () => {
    const user = await User.create({
      username,
      email,
      password,
    });

    expect(user.password).not.toBe(password);
    expect(await bcrypt.compare(password, user.password)).toBe(true);
  });

  test("does not return the password in JSON", async () => {
    const user = await User.findOne({ username }).select("+password");

    expect(user.toJSON().password).toBeUndefined();
  });

  test("does not select the password by default", async () => {
    const user = await User.findOne({ username });

    expect(user.password).toBeUndefined();
  });

  test("maintains timestamps", async () => {
    const user = await User.findOne({ username });

    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.updated_at).toBeInstanceOf(Date);
  });

  test("rejects an invalid email", async () => {
    const user = new User({
      username: `invalid_${id}`,
      email: "not-an-email",
      password,
    });

    await expect(user.validate()).rejects.toHaveProperty("errors.email");
  });

  test("rejects a password shorter than 8 characters", async () => {
    const user = new User({
      username: `short_${id}`,
      email: `short_${id}@example.com`,
      password: "short",
    });

    await expect(user.validate()).rejects.toHaveProperty("errors.password");
  });

  test("rejects duplicate usernames", async () => {
    const duplicate = new User({
      username,
      email: `other_${id}@example.com`,
      password,
    });

    await expect(duplicate.save()).rejects.toMatchObject({ code: 11000 });
  });

  test("rejects duplicate emails", async () => {
    const duplicate = new User({
      username: `other_${id}`,
      email,
      password,
    });

    await expect(duplicate.save()).rejects.toMatchObject({ code: 11000 });
  });
});
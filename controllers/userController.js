
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    // Validate required fields and their types.
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username, email, and password must be provided as strings",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || !password.trim()) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
      });
    }

    if (normalizedEmail.length > 254) {
      return res.status(400).json({
        message: "Email cannot exceed 254 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "A valid email is required",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 8 and 72 characters",
      });
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        message: "Username contains invalid characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Validation failed",
        errors:
          error.name === "ValidationError"
            ? Object.values(error.errors).map((err) => err.message)
            : [error.message],
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    // Accept username OR email, together with a password.
    const hasUsername =
      typeof username === "string" && username.trim().length > 0;

    const hasEmail =
      typeof email === "string" && email.trim().length > 0;

    if (hasUsername && hasEmail) {
      return res.status(400).json({
        message: "Provide either username or email, not both",
      });
    }

    const identifier = hasUsername ? username.trim() : email?.trim();

    if (
      typeof identifier !== "string" ||
      !identifier ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }

    if (identifier.length > 254 || password.length > 72) {
      return res.status(400).json({
        message: "Login input exceeds the permitted length",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Authentication service is not configured",
      });
    }

    const query = hasEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const user = await User.findOne(query).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid username/email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { signup, login };

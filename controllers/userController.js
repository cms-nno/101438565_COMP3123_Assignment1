
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const handleUserError = (res, error, operation) => {
  // Duplicate username or email.
  if (error.code === 11000) {
    logger.warn("User registration conflict", {
      operation,
      status: 409,
    });

    return res.status(409).json({
      message: "Username or email already exists",
    });
  }

  // Mongoose validation errors.
  if (error.name === "ValidationError") {
    logger.warn("User validation failed", {
      operation,
      status: 400,
    });

    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(error.errors).map(
        (item) => item.message
      ),
    });
  }

  // Invalid MongoDB field values.
  if (error.name === "CastError") {
    logger.warn("Invalid user field value", {
      operation,
      status: 400,
    });

    return res.status(400).json({
      message: "Invalid field value",
    });
  }

  // Log server-side details without exposing them to clients.
  logger.error("User operation failed", {
    operation,
    error: error.message,
    status: 500,
  });

  return res.status(500).json({
    message: "Internal server error",
  });
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      logger.warn("Signup validation failed", {
        reason: "Missing or invalid field types",
        status: 400,
      });

      return res.status(400).json({
        message:
          "Username, email, and password must be provided as strings",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || !password.trim()) {
      logger.warn("Signup validation failed", {
        reason: "Required fields are missing",
        status: 400,
      });

      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 30
    ) {
      logger.warn("Signup validation failed", {
        reason: "Invalid username length",
        status: 400,
      });

      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
      });
    }

    if (normalizedEmail.length > 254) {
      logger.warn("Signup validation failed", {
        reason: "Email exceeds maximum length",
        status: 400,
      });

      return res.status(400).json({
        message: "Email cannot exceed 254 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      logger.warn("Signup validation failed", {
        reason: "Invalid email format",
        status: 400,
      });

      return res.status(400).json({
        message: "A valid email is required",
      });
    }

    if (password.length < 8 || password.length > 72) {
      logger.warn("Signup validation failed", {
        reason: "Invalid password length",
        status: 400,
      });

      return res.status(400).json({
        message: "Password must be between 8 and 72 characters",
      });
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(normalizedUsername)) {
      logger.warn("Signup validation failed", {
        reason: "Invalid username characters",
        status: 400,
      });

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
      logger.warn("Signup conflict", {
        reason: "Username or email already exists",
        status: 409,
      });

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

    logger.info("User registered successfully", {
      userId: user._id.toString(),
      status: 201,
    });

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
    return handleUserError(res, error, "Signup");
  }
};

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    const hasUsername =
      typeof username === "string" && username.trim().length > 0;

    const hasEmail =
      typeof email === "string" && email.trim().length > 0;

    if (hasUsername && hasEmail) {
      logger.warn("Login validation failed", {
        reason: "Both username and email supplied",
        status: 400,
      });

      return res.status(400).json({
        message: "Provide either username or email, not both",
      });
    }

    const identifier = hasUsername
      ? username.trim()
      : hasEmail
        ? email.trim()
        : null;

    if (
      !identifier ||
      typeof password !== "string" ||
      !password
    ) {
      logger.warn("Login validation failed", {
        reason: "Missing username/email or password",
        status: 400,
      });

      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }

    if (identifier.length > 254 || password.length > 72) {
      logger.warn("Login validation failed", {
        reason: "Input exceeds permitted length",
        status: 400,
      });

      return res.status(400).json({
        message: "Login input exceeds the permitted length",
      });
    }

    if (!process.env.JWT_SECRET) {
      logger.error("Authentication service is not configured", {
        reason: "JWT secret missing",
        status: 500,
      });

      return res.status(500).json({
        message: "Authentication service is not configured",
      });
    }

    const query = hasEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const user = await User.findOne(query).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      logger.warn("Login failed", {
        reason: "Invalid credentials",
        status: 401,
      });

      return res.status(401).json({
        message: "Invalid username/email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    logger.info("Login successful", {
      userId: user._id.toString(),
      status: 200,
    });

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
    return handleUserError(res, error, "Login");
  }
};

module.exports = { signup, login };


require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "OK",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting: maximum 100 requests per 15 minutes per IP.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// API routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/emp", employeeRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "COMP3123 Assignment 1 API is running",
  });
});

// Handle unsupported routes.
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

// Centralized error handler.
app.use((err, req, res, next) => {
  console.error("Request error:", {
    method: req.method,
    path: req.path,
    message: err.message,
  });

  if (res.headersSent) {
    return next(err);
  }

  // Malformed JSON submitted to express.json().
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    Object.prototype.hasOwnProperty.call(err, "body")
  ) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  // Request body exceeds the configured body-size limit.
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;

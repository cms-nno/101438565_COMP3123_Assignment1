
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Authentication failed: token missing", {
      method: req.method,
      path: req.path,
      status: 401,
    });

    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Authentication failed: empty bearer token", {
      method: req.method,
      path: req.path,
      status: 401,
    });

    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  if (!process.env.JWT_SECRET) {
    logger.error("Authentication configuration error", {
      reason: "JWT_SECRET is not configured",
      status: 500,
    });

    return res.status(500).json({
      message: "Authentication service is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      logger.warn("Authentication failed: invalid token payload", {
        method: req.method,
        path: req.path,
        status: 401,
      });

      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.user = { id: decoded.userId };

    next();
  } catch (error) {
    const reason =
      error.name === "TokenExpiredError"
        ? "Token expired"
        : error.name === "JsonWebTokenError"
          ? "Invalid token"
          : "Token verification failed";

    logger.warn("Authentication failed", {
      method: req.method,
      path: req.path,
      reason,
      status: 401,
    });

    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = authenticateToken;

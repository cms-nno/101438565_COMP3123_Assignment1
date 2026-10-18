const winston = require("winston");
const path = require("path");

const logDirectory = path.join(__dirname, "..", "logs");

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    // Save all informational messages, warnings, and errors.
    new winston.transports.File({
      filename: path.join(logDirectory, "application.log"),
      level: "info",
    }),

    // Save errors separately for easier troubleshooting.
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
  ],
});

// Also print logs to the terminal during development.
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
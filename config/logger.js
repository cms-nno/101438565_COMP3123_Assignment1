const winston = require("winston");
const path = require("path");

const isVercel = process.env.VERCEL === "1";

const transports = [];

// Vercel: write logs to the console so they appear in Runtime Logs.
if (isVercel) {
  transports.push(
    new winston.transports.Console()
  );
} else {
  // Local development: save logs to files.
  const logDirectory = path.join(__dirname, "..", "logs");

  transports.push(
    new winston.transports.File({
      filename: path.join(logDirectory, "application.log"),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});

module.exports = logger;

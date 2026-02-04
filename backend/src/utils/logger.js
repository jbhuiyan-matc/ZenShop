import winston from 'winston';

/**
 * Custom Log Format
 * 
 * Formats logs as: "TIMESTAMP LEVEL: MESSAGE"
 * Example: "2023-10-27T10:00:00.000Z INFO: Server started"
 */
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

/**
 * Winston Logger Configuration
 * 
 * Configures a multi-transport logger:
 * 1. Console: For development and immediate feedback.
 * 2. Error Log File: Captures only 'error' level logs.
 * 3. Combined Log File: Captures all logs.
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Include stack trace on errors
    logFormat
  ),
  defaultMeta: { service: 'zenshop-api' },
  transports: [
    // Console transport - colorful and simple for CLI
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport - daily rotating file for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport - all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Stream Adapter for Morgan
 * 
 * Allows Morgan HTTP request logger to pipe logs into Winston.
 * Removes trailing newlines to keep logs clean.
 */
export const logStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

const morgan = require("morgan");
const { createLogger, transports, format } = require("winston");

require("winston-mongodb");

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    format.align(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: "./logs/all-logs.log",
      json: false,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // new transports.Console(),
    new transports.MongoDB({
      level: "error",
      //mongo database connection link
      db: process.env.DATABASE_URL,
      options: {
        useUnifiedTopology: true,
      },
      // A collection to save json formatted logs
      collection: "server_logs",
      format: format.combine(
        format.timestamp(),
        // Convert logs to a json format
        format.json()
      ),
    }),
  ],
});

logger.stream = {
  write: (message) =>
    logger.info(message.substring(0, message.lastIndexOf("\n"))),
};

module.exports = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  { stream: logger.stream }
);

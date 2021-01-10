const winston = require("winston");

const dateFormat = () => {
  return new Date(Date.now()).toUTCString();
};

class LoggerService {
  constructor(route) {
    this.log_data = null;
    this.route = route;

    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: `./${this.route}.log`,
        }),
      ],
      format: winston.format.printf((info) => {
        let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${
          this.route
        }.log | ${info.message} | `;
        message = info.obj
          ? message + `data: ${JSON.stringify(info.obj)} | `
          : message;
        message = this.log_data
          ? message + `log_data: ${JSON.stringify(this.log_data)} | `
          : message;
        return message;
      }),
    });
    this.logger = logger;
  }
  setLogData(log_data) {
    if (Object.keys(log_data).length === 0) {
      this.log_data = null;
    } else {
      this.log_data = log_data;
    }
  }
  async info(message, obj = null) {
    this.logger.log("info", message, { obj });
  }
  async debug(message, obj = null) {
    this.logger.log("debug", message, { obj });
  }
  async error(message, obj = null) {
    this.logger.log("error", message, { obj });
  }
}

module.exports = LoggerService;

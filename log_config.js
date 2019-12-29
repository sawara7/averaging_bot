const path = require("path");
const APP_ROOT = path.join(__dirname, "./");

module.exports = {
  appenders: {
    consoleLog: {
      type: "console"
    },
    systemLog: {
      type: "file",
      filename: path.join(APP_ROOT, "./log/" + "system.log"),
      pattern: "-yyyy-MM-dd-hh-mm",
      maxLogSize: 5000000,
      backups: 5,
      compress: true
    }
  },
  categories: {
    default: {
      appenders: ["consoleLog"],
      level: "ALL"
    },
    system: {
      appenders: ["systemLog"],
      level: "ALL"
    }
  }
};
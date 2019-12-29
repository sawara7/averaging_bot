"use strict";

const log4js = require("log4js");
const config = require("./log_config");
log4js.configure(config);

const console = log4js.getLogger();
const system = log4js.getLogger("system");

module.exports = {
  console,
  system
};
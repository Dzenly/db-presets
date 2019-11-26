'use strict';

const logger = require('../../logger/logger')('[params-check] ');

exports.checkString = function checkString(val, paramName) {
  if (typeof val !== 'string') {
    logger.error(`Задайте строковой параметр: "${paramName}", помощь по командам можно посмотреть так: "db-p -h"`);
    return false;
  }
  return true;
};

exports.checkBoolean = function checkBoolean(val, paramName) {
  if (typeof val !== 'boolean') {
    logger.error(`Задайте булевый параметр: "${paramName}", помощь по командам можно посмотреть так: "db-p -h"`);
    return false;
  }
  return true;
};

exports.checkCall = function checkCall(funcName, params, stringArgsArr) {
  logger.info(`${funcName}(${JSON.stringify(params)})`);
  if (stringArgsArr) {
    let wasError = false;
    for (const key of stringArgsArr) {
      if (!exports.checkString(params[key], key)) {
        wasError = true;
      }
    }
    if (wasError) {
      process.exit(1);
    }
  }
};

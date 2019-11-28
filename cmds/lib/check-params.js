'use strict';

const logger = require('../../logger/logger')('[params-check] ');

exports.checkString = function checkString(val, paramName) {
  if (typeof val !== 'string') {
    logger.error(`Задайте строковой параметр: "${paramName}", помощь по командам можно посмотреть так: "db-p -h"`);
    return false;
  }
  return true;
};

exports.checkCall = function checkCall(
  funcName,
  params,
  {
    mandatoryArgsArr = [],
    optionalArgsArr = [],
  }
) {
  logger.info(`${funcName}(${JSON.stringify(params)})`);
  let wasError = false;

  for (const key of mandatoryArgsArr) {
    if (!exports.checkString(params[key], key)) {
      wasError = true;
    }
  }

  for (const param of Object.keys(params)) {
    if (!mandatoryArgsArr.includes(param) && !optionalArgsArr.includes(param)) {
      logger.error(`Неверное название параметра ${param} для функции ${funcName}.`);
      wasError = true;
    }
  }

  if (wasError) {
    process.exit(1);
  }
};

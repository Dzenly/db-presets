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
  params = {},
  {
    mandatoryArgs = [],
    optionalArgs = [],
  } = {}
) {
  logger.info(`${funcName}(${JSON.stringify(params)})`);
  let wasError = false;

  for (const key of mandatoryArgs) {
    if (!exports.checkString(params[key], key)) {
      wasError = true;
    }
  }

  for (const param of Object.keys(params)) {
    if (!mandatoryArgs.includes(param) && !optionalArgs.includes(param)) {
      logger.error(`Неверное название параметра ${param} для функции ${funcName}.`);
      wasError = true;
    }
  }

  if (wasError) {
    process.exit(1);
  }
};

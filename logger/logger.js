'use strict';

const winston = require('winston');
const logPrefixer = require('dz-log-prefix');

// TODO Сделать, чтобы движок тестирования мог задать контекст?

console.log(`DBP_LOGFILE: ${process.env.DBP_LOGFILE}, DBP_CON_LOG_LEVEL: ${process.env.DBP_CON_LOG_LEVEL}, DBP_FILE_LOG_LEVEL: ${process.env.DBP_FILE_LOG_LEVEL}`);

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: process.env.DBP_CON_LOG_LEVEL || 'info',
      colorize: true,
      timestamp: false,
      prettyPrint: true,
      showLevel: true,
    }),
    new winston.transports.File({
      level: process.env.DBP_FILE_LOG_LEVEL || 'info',
      timestamp: true,
      prettyPrint: true,
      showLevel: true,
      filename: process.env.DBP_LOGFILE,
      json: false,
    }),
  ],
});


/**
 * Returns logger.
 * @param {String} prefix - All logged strings will be prefixed by this value.
 * @return {Object} - logger.
 */
module.exports = function getLogger(prefix) {
  return logPrefixer.addPrefixToCommonLogFuncs(logger, prefix);
};

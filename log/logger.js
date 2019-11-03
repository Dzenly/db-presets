'use strict';

const winston = require('winston');
const logPrefixer = require('../index.js');

/**
 * logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        colorize: true,
        timestamp: false,
        prettyPrint: true,
        showLevel: true,
      }),
    ],
  });
 */

/**
 * Returns logger.
 * @param {String} prefix - All logged strings will be prefixed by this value.
 * @return {Object} - logger.
 */
module.exports = function getLogger(prefix) {
  return logPrefixer.addPrefixToCommonLogFuncs(winston, prefix);
};

'use strict';

const winston = require('winston');
const logPrefixer = require('dz-log-prefix');

// TODO Сделать, чтобы движок тестирования мог задать контекст?

// console.log(`DBP_LOGFILE: ${process.env.DBP_LOGFILE}, DBP_CON_LOG_LEVEL: ${process.env.DBP_CON_LOG_LEVEL}, DBP_FILE_LOG_LEVEL: ${process.env.DBP_FILE_LOG_LEVEL}`);

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console((function(opts) {
          const newOpts = {};
          const formatArray = [];
          const formatOptions = {
            stringify: () => winston.format((info) => { info.message = JSON.stringify(info.message); })(),
            formatter: () => winston.format((info) => { info.message = opts.formatter(Object.assign(info, opts)); })(),
            json: () => winston.format.json(),
            raw: () => winston.format.json(),
            label: () => winston.format.label(opts.label),
            logstash: () => winston.format.logstash(),
            prettyPrint: () => winston.format.prettyPrint({depth: opts.depth || 2}),
            colorize: () => winston.format.colorize({level: opts.colorize === true || opts.colorize === 'level', all: opts.colorize === 'all', message: opts.colorize === 'message'}),
            timestamp: () => winston.format.timestamp(),
            align: () => winston.format.align(),
            showLevel: () => winston.format((info) => { info.message = info.level + ': ' + info.message; })()
          }
          Object.keys(opts).filter(k => !formatOptions.hasOwnProperty(k)).forEach((k) => { newOpts[k] = opts[k]; });
          Object.keys(opts).filter(k => formatOptions.hasOwnProperty(k) && formatOptions[k]).forEach(k => formatArray.push(formatOptions[k]()));
          newOpts.format = winston.format.combine(...formatArray);
          return newOpts;
        })({
      level: process.env.DBP_CON_LOG_LEVEL || 'info',
      colorize: true,
      timestamp: false,
      prettyPrint: true,
      showLevel: true,
    })),
    new winston.transports.File((function(opts) {
          const newOpts = {};
          const formatArray = [];
          const formatOptions = {
            stringify: () => winston.format((info) => { info.message = JSON.stringify(info.message); })(),
            formatter: () => winston.format((info) => { info.message = opts.formatter(Object.assign(info, opts)); })(),
            json: () => winston.format.json(),
            raw: () => winston.format.json(),
            label: () => winston.format.label(opts.label),
            logstash: () => winston.format.logstash(),
            prettyPrint: () => winston.format.prettyPrint({depth: opts.depth || 2}),
            colorize: () => winston.format.colorize({level: opts.colorize === true || opts.colorize === 'level', all: opts.colorize === 'all', message: opts.colorize === 'message'}),
            timestamp: () => winston.format.timestamp(),
            align: () => winston.format.align(),
            showLevel: () => winston.format((info) => { info.message = info.level + ': ' + info.message; })()
          }
          Object.keys(opts).filter(k => !formatOptions.hasOwnProperty(k)).forEach((k) => { newOpts[k] = opts[k]; });
          Object.keys(opts).filter(k => formatOptions.hasOwnProperty(k) && formatOptions[k]).forEach(k => formatArray.push(formatOptions[k]()));
          newOpts.format = winston.format.combine(...formatArray);
          return newOpts;
        })({
      level: process.env.DBP_FILE_LOG_LEVEL || 'info',
      timestamp: true,
      prettyPrint: true,
      showLevel: true,
      filename: process.env.DBP_LOGFILE,
      json: false,
    })),
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

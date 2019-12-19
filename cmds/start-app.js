'use strict';

const { startApp } = require('./lib/app');
const logger = require('../logger/logger')('[start-app] ');
const { checkCall } = require('./lib/check-params');

module.exports = async function startApplication(params) {
  checkCall('start-app', params, {
    optionalArgs: ['url', 'quietly'],
  });
  const {
    url,
    quietly,
  } = params;

  await startApp(url, quietly);

  logger.info('start-app: finished');
};

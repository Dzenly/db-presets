'use strict';

const { startApp } = require('./lib/app');
const logger = require('../logger/logger')('[start-app] ');
const { checkCall } = require('./lib/check-params');

module.exports = async function startApplication(params) {
  checkCall('start-app', params, {
    optionalArgs: ['url', 'quietly'],
  });
  const {
    url = process.env.DBP_APP_DEF_URL,
    quietly,
  } = params;

  await startApp(url, quietly);

  logger.info('start-app: finished');
};

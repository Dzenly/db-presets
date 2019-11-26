'use strict';

const s3 = require('./lib/s3');
const logger = require('../logger/logger')('[get-lock] ');
const { checkCall } = require('./lib/check-params');

module.exports = function getlock(params) {
  checkCall('getLock', params, ['name']);
  const { name } = params;
  const metadata = s3.getMetaData(name);

  if (metadata.key) {
    logger.warn(`Пресет "${name}" заблокирован:\ndate: ${metadata.date}\nwho: ${metadata.who}\ndesc: ${metadata.desc}`);
    process.exit(1);
  } else {
    logger.info(`Пресет "${name}" свободен, можете блокировать.`);
  }
};

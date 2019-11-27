'use strict';

const s3 = require('./lib/s3');
const logger = require('../logger/logger')('[set-lock] ');
const { checkCall } = require('./lib/check-params');

module.exports = function resetLock(params) {
  checkCall('resetLock', params, ['name', 'key']);
  const { name, key } = params;
  const oldMetadata = s3.getMetaData(name);

  if (!oldMetadata.key) {
    logger.error(`Пресет "${name}" не был заблокирован.`);
    process.exit(1);
  }

  if (oldMetadata.key !== key) {
    logger.error(`Ключ для разблокироваки пресета "${name}" неверный.`);
    process.exit(1);
  }

  s3.resetMetaData(name);

  logger.info(`Пресет "${name}" разблокирован.`);
};

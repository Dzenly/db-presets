'use strict';

const crypto = require('crypto');

const s3 = require('./lib/s3');
const logger = require('../logger/logger')('[set-lock] ');
const { checkCall } = require('./lib/check-params');

module.exports = function setlock(params) {
  checkCall('setLock', params, ['name', 'locker', 'desc']);
  const { name, locker, desc } = params;
  const oldMetadata = s3.getMetaData(name);

  if (oldMetadata.key) {
    logger.error(`Пресет уже заблокирован:\ndate: ${oldMetadata.date}\nlocker: ${oldMetadata.locker}\ndesc: ${oldMetadata.desc}`);
    process.exit(1);
  }

  const key = crypto.randomBytes(2).toString('hex');
  const date = (new Date()).toISOString();

  const newMetadata = {
    key,
    date,
    locker,
    desc,
  };

  s3.setMetaData(name, newMetadata);

  logger.info(`Пресет "${name}" заблокирован, запомните ключ: "${key}", он будет нужен для апдейта или разблокировки.`);
};

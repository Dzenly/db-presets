'use strict';

const { startApp, stopApp } = require('./lib/app');
const db = require('./lib/db');
const { getCurPresetInfo } = require('./lib/files');
const logger = require('../logger/logger')('[select] ');
const { checkCall } = require('./lib/check-params');

module.exports = async function select(params) {
  checkCall('select', params, {
    mandatoryArgs: ['name'],
    optionalArgs: ['clean', 'quietly', 'url'],
  });
  const {
    name,
    clean,
    url = process.env.DBP_APP_DEF_URL,
    quietly,
  } = params;

  const presetInfo = getCurPresetInfo();
  if (presetInfo.name === name) {
    if (presetInfo.clean || !clean) {
      logger.verbose(`Пресет "${name}" уже выбран и он чистый либо чистый не требуется`);
      return;
    }
    logger.verbose(`Пресет "${name}" уже выбран, но он dirty, а нужен чистый.`);
  }

  logger.verbose(`Выбран пресет "${presetInfo.name}", а нужен "${name}".`);

  stopApp(quietly);

  db.restoreBin(name, quietly);

  await startApp(url, quietly);

  logger.info('select: finished');
};

'use strict';

const { startApp, stopApp, isRunning } = require('./lib/app');
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
    url,
    quietly,
  } = params;

  const presetInfo = getCurPresetInfo();
  if (presetInfo.name === name) {
    if (presetInfo.clean || !clean) {
      logger.verbose(`Пресет "${name}" уже выбран и он чистый либо чистый не требуется`);
      if (!await isRunning(url, quietly)) {
        await startApp(url, quietly);
      }
      return;
    }
    logger.verbose(`Пресет "${name}" уже выбран, но он dirty, а нужен чистый.`);
  } else {
    logger.verbose(`Выбран пресет "${presetInfo.name}", а нужен "${name}".`);
  }

  if (await isRunning(url, quietly)) {
    stopApp(quietly);
  }

  db.restoreBin(name, quietly);

  await startApp(url, quietly);

  logger.info('select: finished');
};

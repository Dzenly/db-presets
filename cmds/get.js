'use strict';

const { readdirSync } = require('fs');

const { execWithOutput } = require('./lib/exec');
const { checkCall } = require('./lib/check-params');

const { restoreBin } = require('./lib/db');
const logger = require('../logger/logger')('[get] ');

const s3 = require('./lib/s3');
const { branchDirData, branchDirArc } = require('../common/consts');
const { decryptUntarXz } = require('./lib/files');
const { createBinData, migrate, restore } = require('./lib/db');
const { stopApp, startApp } = require('./lib/app');

// TODO: не разворачивать в data, параметр.
module.exports = async function get(params) {
  checkCall('get', params, {
    optionalArgs: ['only', 'start-app'],
  });
  const { only } = params;

  // eslint-disable-next-line no-param-reassign
  const onlyArr = only ? only.split(',') : [];

  // Пресет, который нужно выбрать.
  let toSelect;

  if (only) {
    const lsArr = s3.lsCleaned(true);
    for (const onlyItem of onlyArr) {
      if (!lsArr.includes(onlyItem)) {
        logger.error(`В базе пресетов на S3 нет пресета: ${onlyItem}`);
        process.exit(1);
      }
    }
    toSelect = onlyArr[onlyArr.length - 1];
  }

  stopApp();

  s3.sync({
    include: onlyArr,
    quietly: true,
  });

  let presets = readdirSync(branchDirArc);

  if (toSelect) {
    // Поместим toSelect в конец. Тогда он выберется автоматом.
    presets = presets.filter((item) => item !== toSelect);
    presets.push(toSelect);
    toSelect = null;
  }

  for (const encArcPreset of presets) {
    await decryptUntarXz(encArcPreset);

    restore(encArcPreset);

    migrate(encArcPreset);

    createBinData(encArcPreset, true);
  }

  if (toSelect) {
    restoreBin(toSelect);
  }

  if (params['start-app']) {
    await startApp();
  }

  logger.info('get: finished');

  // TODO: написать что все завершилось успешно?
};

'use strict';

const { execWithOutput } = require('./lib/exec');
const { checkCall } = require('./lib/check-params');

const { restoreBin } = require('./lib/db');
const logger = require('../logger/logger')('[pull] ');

const s3 = require('./lib/s3');
const { branchDirData } = require('../common/consts');
const { decryptUntarXz, setCurPresetInfo } = require('./lib/files');
const { createBinData, migrate, restore } = require('./lib/db');
const { stopApp } = require('./lib/app');

// TODO: не разворачивать в data, параметр.
module.exports = async function pull(params) {
  checkCall('pull', params, 'onlyArr');
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

  let syncedList = s3.sync({
    include: onlyArr,
    quietly: true,
  });

  if (syncedList.includes(toSelect)) {
    // Элемент есть среди тех, кто обновился. Поместим его в конец. Тогда он выберется автоматом.
    syncedList = syncedList.filter((item) => item !== toSelect);
    syncedList.push(toSelect);
    toSelect = null;
  }

  for (const encArcPreset of syncedList) {
    await decryptUntarXz(encArcPreset);

    restore(encArcPreset);

    migrate();

    createBinData(encArcPreset);
  }

  if (toSelect) {
    restoreBin(toSelect);
  } else {
    setCurPresetInfo({
      name: syncedList[syncedList.length - 1],
      clean: true,
    });
  }

  logger.verbose('==== Подправляем права доступа на директории с пресетами.');

  execWithOutput(`sudo chown -R postgres:${process.env.USER} ${branchDirData}`);
  execWithOutput(`sudo chmod -R 0750 ${branchDirData}`);

  // TODO: написать что все завершилось успешно?
};

'use strict';

const { readdirSync, mkdirSync } = require('fs');
const { execWithOutput } = require('./lib/exec');
const logger = require('../logger/logger')('[pull] ');

const s3 = require('./lib/s3');
const {
  branchDirArc, branchDirSql, branchDirData, sqlExt,
} = require('../common/consts');
const { decryptUntarXz, setCurPresetInfo } = require('./lib/files');
const { createBinData, migrate, restore } = require('./lib/db');
const { stop } = require('./lib/app');

// TODO: не разворачивать в data, параметр.
// Хорошо бы узнать какие файлы синкались, а какие нет.
// Если какие-то не синкались, то их не надо и разворачивать в бинарные данные.

module.exports = async function pull(params) {
  // `[only=name1,name2]`;

  // eslint-disable-next-line no-param-reassign
  const only = params.only ? params.only.split(',') : [];

  logger.info(`pull, params: ${JSON.stringify(params)}`);

  if (params.only) {
    const lsArr = s3.lsCleaned(true);
    for (const onlyItem of only) {
      if (!lsArr.includes(onlyItem)) {
        logger.error(`В базе пресетов на S3 нет пресета: ${onlyItem}`);
        process.exit(1);
      }
    }
  }

  stop();

  s3.sync({
    include: only,
  });

  const envArcPresets = params.only ? [params.only] : readdirSync(branchDirArc);

  for (const encArcPreset of envArcPresets) {
    await decryptUntarXz(encArcPreset);

    restore(encArcPreset);

    migrate();

    createBinData(encArcPreset);
  }

  setCurPresetInfo({
    name: envArcPresets[envArcPresets.length - 1],
    clean: true,
  });

  logger.verbose('==== Подправляем права доступа на директории с пресетами.');

  execWithOutput(`sudo chgrp -R postgres  ${process.env.DBP_PRESETS_DIR}`);
  execWithOutput(`sudo chmod -R g+u  ${process.env.DBP_PRESETS_DIR}`);

  // TODO: написать что все завершилось успешно?
};

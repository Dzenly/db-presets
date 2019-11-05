'use strict';

require(process.env.DBP_ENV_VARS_PATH);

const cp = require('child_process');
const timer = require('dz-timer-utils');
const { join } = require('path');

const { changeLogSuffix } = require('../../cfg/consts');

const log = require('../log/logger')('[files] ');

/* eslint-disable no-console */

/**
 * Архивирует список директорий и файлов с помощью tar и xz.
 *
 * @param cwd - Абсолютный путь к текущей рабочей директории, файлы должны быть в ней,
 * архив тоже будет в ней.
 * @param presetName - Имя пресета бд (как имя файла, но без sql).
 */
exports.tarXzEncrypt = function tarXzEncrypt(cwd, presetName) {
  const xzTimer = timer.startTimer(`${presetName} xz`);
  log.verbose(`Creating ${presetName} archive ...`);
  cp.execSync(
    `tar -cJSf ${presetName}.tar.xz ${presetName}.sql ${presetName}${changeLogSuffix}`,
    {
      cwd,
      windowsHide: true,
    }
  );

  log.verbose(xzTimer.stopTimer(true));

  const ciphTimer = timer.startTimer(`${presetName} cipher`);
  log.verbose(`Ciphering ${presetName} archive ...`);

  log.verbose(ciphTimer.stopTimer(true));
};


// const cipher = crypto.createCipheriv(aesAlgName, curKey, curIV);
// let encrypted = cipher.update(data, 'utf8', 'base64');

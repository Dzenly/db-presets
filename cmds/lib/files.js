'use strict';

const cp = require('child_process');
const { join } = require('path');
const { readFileSync, createReadStream, createWriteStream } = require('fs');
const crypto = require('crypto');

const timer = require('dz-timer-utils');

require(process.env.DBP_ENV_VARS_PATH);

const {
  aesIVLength,
  aesAlgName,
  changeLogSuffix,
} = require('../../cfg/consts');

const log = require('../../log/logger')('[files] ');

/* eslint-disable no-console */

/**
 * Архивирует пресет и changelog к нему, с помощью tar + gz и шифрует его aes256 алгоритмом.
 *
 * @param cwd - Абсолютный путь к текущей рабочей директории, файлы должны быть в ней,
 * архив тоже будет в ней.
 * @param presetName - Имя пресета бд (как имя файла, но без sql).
 */
exports.tarXzEncrypt = async function tarXzEncrypt(cwd, presetName) {
  const arcName = `${presetName}.tar.xz`;

  const xzTimer = timer.startTimer(`${presetName} xz`);
  log.verbose(`Creating ${presetName} archive ...`);
  cp.execSync(
    `tar -cJSf ${arcName} ${presetName}.sql ${presetName}${changeLogSuffix}`,
    {
      cwd,
      windowsHide: true,
    }
  );

  log.verbose(xzTimer.stopTimer(true));

  const vectorAndKey = readFileSync(process.env.DBP_AESKEY_PATH);

  const ciphTimer = timer.startTimer(`${presetName} cipher`);
  log.verbose(`Ciphering ${presetName} archive ...`);

  const cipher = crypto.createCipheriv(
    aesAlgName,
    vectorAndKey.slice(aesIVLength),
    vectorAndKey.slice(0, aesIVLength)
  );

  const inputPath = join(cwd, arcName);

  const outputPath = join(cwd, presetName);

  const input = createReadStream(inputPath);
  const output = createWriteStream(outputPath);

  await new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output);
    output.on('close', resolve);
    output.on('error', reject);
  });

  log.verbose(ciphTimer.stopTimer(true));
};

/**
 * Дешифрует пресет и changelog, и разархивирует их.
 *
 * @param cwd - Абсолютный путь к текущей рабочей директории, файл должен быть в ней,
 * результат тоже будет в ней.
 * @param presetName - Имя пресета бд (как имя файла, но без sql).
 */
exports.decryptUntarXz = async function decryptUntarXz(cwd, presetName) {
  const arcName = `${presetName}.tar.xz`;

  const vectorAndKey = readFileSync(process.env.DBP_AESKEY_PATH);

  const ciphTimer = timer.startTimer(`${presetName} cipher`);
  log.verbose(`Deciphering ${presetName} archive ...`);

  const decipher = crypto.createDecipheriv(
    aesAlgName,
    vectorAndKey.slice(aesIVLength),
    vectorAndKey.slice(0, aesIVLength)
  );

  const inputPath = join(cwd, presetName);

  const outputPath = join(cwd, arcName);

  const input = createReadStream(inputPath);
  const output = createWriteStream(outputPath);

  await new Promise((resolve, reject) => {
    input.pipe(decipher).pipe(output);
    output.on('close', resolve);
    output.on('error', reject);
  });

  log.verbose(ciphTimer.stopTimer(true));

  const xzTimer = timer.startTimer(`${presetName} xz`);
  log.verbose(`Extracting ${arcName} archive ...`);
  cp.execSync(`tar -xJf ${arcName}`, {
    cwd,
    windowsHide: true
  });

  log.verbose(xzTimer.stopTimer(true));
};

exports.decryptUntarXz('/opt/db-presets/r-vision/4.1', 'common');

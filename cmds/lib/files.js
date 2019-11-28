'use strict';

const cp = require('child_process');
const { join } = require('path');
const {
  readFileSync, writeFileSync, createReadStream, createWriteStream, unlinkSync,
} = require('fs');
const crypto = require('crypto');

const timer = require('dz-timer-utils');
const {
  branchDirArc,
  sqlExt,
  branchDirSql,
  aesIVLength,
  aesAlgName,
  changeLogSuffix,
  currentPresetInfoFile,
} = require('../../common/consts');

require(process.env.DBP_ENV_VARS_PATH);

const log = require('../../logger/logger')('[files] ');

/* eslint-disable no-console */

/**
 * Архивирует пресет и changelog к нему, с помощью tar + gz и шифрует его aes256 алгоритмом.
 *
 * @param presetName - Имя пресета бд (как имя файла, но без sql).
 */
exports.tarXzEncrypt = async function tarXzEncrypt(presetName) {
  const arcName = `${presetName}.tar.xz`;

  const arcPath = join(branchDirArc, arcName);

  const xzTimer = timer.startTimer(`${presetName} xz`);
  log.verbose(`Creating ${presetName} archive ...`);
  cp.execSync(
    `tar -cJSf ${arcPath} ${presetName}${sqlExt} ${presetName}${changeLogSuffix}`,
    {
      cwd: branchDirSql,
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

  const inputArcPath = join(branchDirArc, arcName);

  const outputEncArcPath = join(branchDirArc, presetName);

  const input = createReadStream(inputArcPath);
  const output = createWriteStream(outputEncArcPath);

  await new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output);
    output.on('close', resolve);
    output.on('error', reject);
  });

  log.verbose(ciphTimer.stopTimer(true));

  unlinkSync(inputArcPath);
};

/**
 * Дешифрует пресет и changelog, и разархивирует их.
 *
 * @param cwd - Абсолютный путь к текущей рабочей директории, файл должен быть в ней,
 * результат тоже будет в ней.
 * @param presetName - Имя пресета бд (как имя файла, но без sql).
 */
exports.decryptUntarXz = async function decryptUntarXz(presetName) {
  console.log(`== Расшифровываем и распаковываем пресет: ${presetName}`);

  const arcName = `${presetName}.tar.xz`;

  const vectorAndKey = readFileSync(process.env.DBP_AESKEY_PATH);

  const ciphTimer = timer.startTimer(`${presetName} cipher`);
  log.verbose(`Deciphering archive "${presetName}" ...`);

  const decipher = crypto.createDecipheriv(
    aesAlgName,
    vectorAndKey.slice(aesIVLength),
    vectorAndKey.slice(0, aesIVLength)
  );

  const inputEncArcPath = join(branchDirArc, presetName);

  const outputArcPath = join(branchDirArc, arcName);

  const input = createReadStream(inputEncArcPath);
  const output = createWriteStream(outputArcPath);

  await new Promise((resolve, reject) => {
    input.pipe(decipher).pipe(output);
    output.on('close', resolve);
    output.on('error', reject);
  });

  log.verbose(ciphTimer.stopTimer(true));

  const xzTimer = timer.startTimer(`${presetName} xz`);
  log.verbose(`Extracting archive "${outputArcPath}" ...`);
  cp.execSync(`tar -xJf ${outputArcPath}`, {
    cwd: branchDirSql,
    windowsHide: true,
  });

  log.verbose(xzTimer.stopTimer(true));

  unlinkSync(outputArcPath);
};

/**
 * Возвращает инфу о текущем поставленном пресете в виде объекта:
 * name - имя пресета.
 * clean - если true - значит пресет поставлен командой get, а не командой select,
 * т.е. этот пресет ещё не использовался в автотестах.
 * @return {{}|any}
 */
exports.getCurPresetInfo = function getCurPresetInfo() {
  try {
    const str = readFileSync(currentPresetInfoFile, 'utf8');
    const data = JSON.parse(str);
    return data;
  } catch (e) {
    return {};
  }
};

/**
 * Возвращает инфу о текущем поставленном пресете в виде строки:
 * name - имя пресета.
 * clean - если true - значит пресет поставлен командой get, а не командой select,
 * т.е. этот пресет ещё не использовался в автотестах.
 * @return {{}|any}
 */
exports.getCurPresetInfoStr = function getCurPresetInfoStr() {
  try {
    const str = readFileSync(currentPresetInfoFile, 'utf8');
    return str;
  } catch (e) {
    return '';
  }
};

exports.setCurPresetInfo = function setCurPresetInfo({
  name,
  clean, // clean - после get, т.е. не после select.
}) {
  const info = {
    name,
    clean,
  };
  writeFileSync(currentPresetInfoFile, JSON.stringify(info, null, 2), 'utf8');
  log.verbose(`setCurPresetInfo: ${JSON.stringify(info)}`);
};

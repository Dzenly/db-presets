'use strict';

const { join } = require('path');
const {
  existsSync, readFileSync, writeFileSync, appendFileSync,
} = require('fs');

const {
  checkPresetAbsent, push, resetMetaData, getMetaData,
} = require('./lib/s3.js');
const { tarXzEncrypt, setCurPresetInfo } = require('./lib/files');
const { createBinData, dump } = require('./lib/db');

const { checkCall } = require('./lib/check-params');

const logger = require('../logger/logger')('[update] ');

const consts = require('../common/consts');

/**
 * Проверка консистентности и целостности пресета.
 * @param name
 */
function checkPreset(name) {
  const sqlPath = join(consts.branchDirSql, `${name}${consts.sqlExt}`);
  const sqlExists = existsSync(sqlPath);

  const encArcPath = join(consts.branchDirArc, `${name}`);
  const arcExists = existsSync(encArcPath);

  const dataPath = join(consts.branchDirData, name);
  const dataExists = existsSync(dataPath);

  if (!sqlExists || !arcExists || !dataExists) {
    logger.error(`Данные повреждены, обратитесь к DevOps'у:\n"${sqlPath}" exists: ${sqlExists} !==\n"${encArcPath}" exists: ${arcExists}`);
    process.exit(1);
  }
}

// ### TODO:
// * Кейс, когда сначала поредактировали один пресет. Сохранили.
// Накатили другой. Сохранили. Потребует обновления после каждого наката.
// Если такое надо будет поддержать, то потом.

module.exports = async function update(params) {
  checkCall('update', params, {
    mandatoryArgs: [
      'name',
      'key',
      'updater',
      'desc',
    ],
  });

  const {
    name, key, updater, desc,
  } = params;

  // Завершит процесс, если ошибешься с именем.
  const metadata = getMetaData(name);

  if (!metadata.key) {
    logger.error(`Пресет "${name}" не заблокирован, заблокируйте его перед тем, как обновлять. См. команду set-lock`);
    process.exit(1);
  }

  if (metadata.key !== key) {
    logger.error(`Ваш ключ "${key}" для разблокировки пресета ${name} неправильный.`);
    process.exit(1);
  }

  checkPreset(name);

  dump(name);

  const changeLogPath = join(consts.branchDirSql, `${name}${consts.changeLogSuffix}`);

  const fileStr = readFileSync(changeLogPath, 'utf8');
  writeFileSync(`\n${(new Date()).toISOString()}: ${updater}: ${desc}\n`, 'utf8');
  appendFileSync(changeLogPath, fileStr);

  await tarXzEncrypt(name);

  push(name);
  resetMetaData(name);

  createBinData(name);

  setCurPresetInfo({
    name,
    clean: true,
  });

  logger.info('update: finished');
};

'use strict';

const { existsSync, writeFileSync } = require('fs');
const { join } = require('path');

const { checkPresetAbsent, push } = require('./lib/s3.js');
const { tarXzEncrypt } = require('./lib/files');
const { createBinData, dump } = require('./lib/db');
const { checkCall } = require('./lib/check-params');

const logger = require('../logger/logger')('[add] ');

const consts = require('../common/consts');

/**
 * Проверка консистентности и целостности пресета.
 * @param name
 */
function checkPreset(name) {
  let success = true;

  const wasInit = existsSync(consts.branchDirSql)
    && existsSync(consts.branchDirArc)
    && existsSync(consts.branchDirData);

  if (!wasInit) {
    logger.error('Нет нужных директорий, возможно, нужно сделать db-p init');
  }

  const sqlPath = join(consts.branchDirSql, `${name}${consts.sqlExt}`);
  const sqlExists = existsSync(sqlPath);

  const encArcPath = join(consts.branchDirArc, `${name}`);
  const arcExists = existsSync(encArcPath);

  const dataPath = join(consts.branchDirData, name);
  const dataExists = existsSync(dataPath);

  if (sqlExists !== arcExists) {
    logger.error(`Данные повреждены, обратитесь к DevOps'у:\n"${sqlPath}" exists: ${sqlExists} !==\n"${encArcPath}" exists: ${arcExists}`);
    success = false;
  }

  if (sqlExists) {
    logger.error(`Sql : "${sqlPath}" уже существует, возможно вам нужна команда "update"`);
    success = false;
  }

  if (arcExists) {
    logger.error(`Архив : "${encArcPath}" уже существует`);
    success = false;
  }

  if (dataExists) {
    logger.error(`Данные : "${dataPath}" уже существуют`);
    success = false;
  }

  if (!success) {
    process.exit(1);
  }
}

// ### TODO:
// * Кейс, когда сначала поредактировали один пресет. Сохранили.
// Накатили другой. Сохранили. Потребует обновления после каждого наката.
// Если такое надо будет поддержать, то потом.

module.exports = async function add(params) {
  checkCall('add', params, {
    mandatoryArgs: [
      'creator',
      'name',
      'desc',
    ],
  });

  const { creator, name, desc } = params;

  checkPreset(name);

  checkPresetAbsent(name);

  const changeLogPath = join(consts.branchDirSql, `${name}${consts.changeLogSuffix}`);

  dump(name);

  writeFileSync(changeLogPath, `${(new Date()).toISOString()}: ${creator}: ${desc}`, 'utf8');

  await tarXzEncrypt(name);

  push(name);

  createBinData(name, true);

  logger.info('add: finished');
};

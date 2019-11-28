'use strict';

const { mkdirSync } = require('fs');
const { join } = require('path');
const { execQuietly, execWithOutput } = require('./exec');
const { setCurPresetInfo } = require('./files');

const {
  branchDirData, branchDirSql, sqlExt,
} = require('../../common/consts');

/**
 * Создает бинарный пресет из текущего состояния базы.
 * @param name - имя пресета.
 * @param fixRights - нужно ли фиксить права.
 * get фиксит сразу все права одной командой, поэтому может ставить false.
 */
exports.createBinData = function createBinData(name, fixRights) {
  console.log(`== Сохраняем бинарный пресет для: ${name}`);

  const dataPath = join(branchDirData, name);

  execWithOutput(`rm -rf ${dataPath}`);
  mkdirSync(dataPath, { recursive: true });
  execWithOutput(`PGPASSWORD=${process.env.DBP_PG_PASSWORD} pg_basebackup -h 127.0.0.1 -U postgres -D ${dataPath}`);

  if (fixRights) {
    console.log('== Подправляем права доступа на директории с пресетами.');
    execWithOutput(`sudo chown -R postgres:${process.env.USER} ${dataPath}`);
    execWithOutput(`sudo chmod -R 0750 ${dataPath}`);
  }

  setCurPresetInfo({
    name,
    clean: true,
  });
};

exports.dump = function dump(name) {
  const sqlFile = `${name}${sqlExt}`;
  execWithOutput(
    `PGPASSWORD=${process.env.DBP_PG_PASSWORD} pg_dumpall -h 127.0.0.1 -U postgres --clean > ${sqlFile}`,
    branchDirSql
  );
};

/**
 * Накатывает миграции на текущее состояние базы.
 * @param name
 */
exports.migrate = function migrate() {
  console.log('== Накатываем миграции на текущее состояние базы.');
  execWithOutput(
    process.env.DBP_MIGR_CMD,
    process.env.DBP_MIGR_WD
  );
};

exports.restore = function restore(name) {
  const sqlName = `${name}${sqlExt}`;
  console.log(`== Восстанавливаем базу из дампа "${sqlName}"`);
  execWithOutput(
    `PGPASSWORD=${process.env.DBP_PG_PASSWORD} psql -h 127.0.0.1 -U postgres -f ${sqlName}`,
    branchDirSql
  );
};

exports.stopPG = function stopPG(quietly) {
  const cmd = process.env.DBP_PG_STOP_CMD;
  if (quietly) {
    return execQuietly(cmd, null, true);
  }
  console.log('Останавливаем PostgreSQL');
  return execWithOutput(cmd);
};

exports.startPG = function startPG(quietly) {
  const cmd = process.env.DBP_PG_START_CMD;
  if (quietly) {
    return execQuietly(cmd, null, true);
  }
  console.log('Запускаем PostgreSQL');
  return execWithOutput(cmd);
};

/**
 *
 * @param name
 * @param quietly
 */
exports.restoreBin = function restoreBin(name, quietly) {
  exports.stopPG(quietly);
  const dataPath = join(branchDirData, name);

  const cmd = `sudo rsync -aAHXch ${dataPath}/ ${process.env.DBP_PG_DATA_DIR} --delete`;

  if (quietly) {
    execQuietly(cmd, null, true);
  } else {
    console.log(`Переключаемся на бинарный пресет \n${cmd}`);
    execWithOutput(cmd);
  }

  setCurPresetInfo({
    name,
    clean: false,
  });

  exports.startPG(quietly);
};

'use strict';

const { existsSync } = require('fs');
const { join, basename } = require('path');
const { writeFileSync } = require('fs');

const { execWithOutput } = require('./lib/exec');
const { checkPresetAbsent, push } = require('./lib/s3.js');
const { tarXzEncrypt } = require('./lib/files');

const { checkString } = require('./lib/check-params');

const logger = require('../logger/logger');

const consts = require('../common/consts');

const prefix = basename(__filename);

function checkPresetExists(name) {
  let success = true;

  const sqlPath = join(consts.branchDirSql, `${name}${consts.sqlExt}`);
  const sqlExists = existsSync(sqlPath);

  const encArcPath = join(consts.branchDirArc, `${name}`);
  const arcExists = existsSync(encArcPath);

  const dataPath = join(consts.branchDirData, name);
  const dataExists = existsSync(dataPath);

  if (sqlExists !== arcExists) {
    console.error(`${prefix}: Данные повреждены, обратитесь к DevOps'у:\n"${sqlPath}" exists: ${sqlExists} !==\n"${encArcPath}" exists: ${arcExists}`);
    success = false;
  }

  if (sqlExists) {
    console.error(`Sql : "${sqlPath}" уже существует, возможно вам нужна команда push-ex (запушить существующий)`);
    success = false;
  }

  if (arcExists) {
    console.error(`Архив : "${encArcPath}" уже существует`);
    success = false;
  }

  if (dataExists) {
    console.error(`Данные : "${dataPath}" уже существуют`);
    success = false;
  }

  return success;
}

// ### TODO:
// * Кейс, когда сначала поредактировали один пресет. Сохранили.
// Накатили другой. Сохранили. Потребует обновления после каждого наката.
// Если такое надо будет поддержать, то потом.

module.exports = async function pushNew({ creator, name, desc }) {

  logger.info(`pushNew(${creator}`);

  checkString(creator, 'creator');
  checkString(name, 'name');
  checkString(desc, 'desc');

  if (!checkPresetExists(name)) {
    process.exit(1);
  }

  checkPresetAbsent(name);

  const sqlFile = `${name}${consts.sqlExt}`;
  const changeLogPath = join(consts.branchDirSql, `${name}${consts.changeLogSuffix}`);

  execWithOutput(
    `PGPASSWORD=${process.env.DBP_PG_PASSWORD} pg_dumpall -h 127.0.0.1 -U postgres --clean > ${sqlFile}`,
    consts.branchDirSql
  );

  writeFileSync(changeLogPath, `${(new Date()).toISOString()}: ${creator}: ${desc}`, 'utf8');

  await tarXzEncrypt(name);

  push(name);
};

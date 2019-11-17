'use strict';

const { existsSync } = require('fs');
const { join, basename } = require('path');
const { writeFileSync } = require('fs');

const { exec } = require('./lib/exec');
const { checkPresetAbsent, push } = require('./lib/s3.js');
const { tarXzEncrypt } = require('./lib/files');

const consts = require('../common/consts');

const prefix = basename(__filename);

function checkPresetExists(name) {
  let success = true;

  const sqlPath = join(consts.branchDirSql, `${name}${consts.sqlExt}`);
  const sqlExists = existsSync(sqlPath);

  const arcPath = join(consts.branchDirArc, `${name}${consts.arcExt}`);
  const arcExists = existsSync(arcPath);

  const dataPath = join(consts.branchDirData, name);
  const dataExists = existsSync(dataPath);

  if (sqlExists !== arcExists) {
    console.error(`${prefix}: Данные повреждены, обратитесь к DevOps'у:\n"${sqlPath}" exists: ${sqlExists} !==\n"${arcPath}" exists: ${arcExists}`);
    success = false;
  }

  if (sqlExists) {
    console.error(`Sql : "${arcPath}" уже существует, возможно вам нужна команда push-ex (запушить существующий)`);
    success = false;
  }

  if (arcExists) {
    console.error(`Архив : "${arcPath}" уже существует`);
    success = false;
  }

  if (dataExists) {
    console.error(`Данные : "${dataPath}" уже существуют`);
    success = false;
  }

  return success;
}

// * `pg_dumpall -h 127.0.0.1 -U postgres --clean > <tmp директория внутри самого модуля>`
// во временную папку.
// * Приtarивание к файлу лога изменений в той же временной папке.
// * xz файла (кол-во потоков = кол-ву процессоров, уровень сжатия - максимальный)
// * криптование симметричным ключом.


// * заливка на amazon S3.
// * Очистка временной папки.

// ### Результат:
//
// * Текущее состояние БД сохранено на amazon S3 в виде нового зашифрованного пресета.
// * Внутри объекта - два файла: пресет и текстовый файл с логом изменений, в который занесен description
// (изменения писать в форме: кто: что_за_изменения).
//
// ### Замечания
//
// * Файлы в /opt/db-presets остаются в необновленном состоянии.
// * Если продолжить редактировать, и сохранить новую версию, все будет ок,
// т.к. последняя сохраненная и находится в БД.
// * Чтобы их обновить нужно `db-p pull-and-update-local ...`.
//
// ### TODO:
//
// * Кейс, когда сначала поредактировали один пресет. Сохранили.
// Накатили другой. Сохранили. Потребует обновления после каждого наката.
// Если такое надо будет поддержать, то потом.

module.exports = async function pushNew(params) {
  let wasError = false;

  if (!params.creator) {
    console.log('Обязательно нужно указать ник создателя пресета с помощью опции creator=<ник>.');
    wasError = true;
  }

  if (!params.name) {
    console.log('Обязательно нужно указать название пресета с помощью опции name=<название>.');
    wasError = true;
  }

  if (!params.desc) {
    console.log('Обязательно нужно указать описание пресета с помощью опции desc="<описание пресета>".');
    wasError = true;
  }

  if (wasError) {
    process.exit(1);
  }

  if (!checkPresetExists(params.name)) {
    process.exit(1);
  }

  checkPresetAbsent(params.name);

  const sqlFile = `${params.name}${consts.sqlExt}`;
  const changeLogPath = join(consts.branchDirSql, `${params.name}${consts.changeLogSuffix}`);

  const { err } = exec(
    `PGPASSWORD=${process.env.DBP_PG_PASSWORD} pg_dumpall -h 127.0.0.1 -U postgres --clean > ${sqlFile}`,
    consts.branchDirSql
  );

  writeFileSync(changeLogPath, params.desc, 'utf8');

  await tarXzEncrypt(params.name);

  push(params.name);

  const asdf = 5;

  // name=my-preset who=my-name desc=description
};

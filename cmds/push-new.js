'use strict';

const { existsSync } = require('fs');
const { join, basename } = require('path');
const assert = require('assert');

const consts = require('../common/consts');

const prefix = basename(__filename);

// `$DBP_PRESETS_DIR/<repo>/<branch>/arc`;

function checkPresetExists(name) {
  const sqlExists = existsSync(join(consts.branchDirSql, `${name}${consts.sqlExt}`));
  const arcExists = existsSync(join(consts.branchDirArc, `${name}${consts.arcExt}`));
  const dataExists = existsSync(join(consts.branchDirData, name));

  assert(sqlExists === arcExists, `${prefix}: ${name}: sqlExists: ${sqlExists} !== arcExists: ${arcExists}`);
  assert(!sqlExists, `${prefix}: ${name}: sqlExists: ${sqlExists}`);
  assert(!dataExists, `${prefix}: ${name}: dataExists: ${dataExists}`);
}

// ## Добавление пресета на amazon (после создания)
//
// `db-p push-new name=my-preset who=my-name desc=description`
//
// ### Шаги:
//
// * Проверки на аргументы и переменные окружения.
// * Проверка что локально нет такого файла, если есть ругнуться, предложить push-ex и выйти.
// * Проверка, что на amazon s3 нет такого файла. Есть есть - ругнуться и выйти.
// * `pg_dumpall -h 127.0.0.1 -U postgres --clean > <tmp директория внутри самого модуля>`
// во временную папку.
// * Приtarивание к файлу лога изменений в той же временной папке.
// * xz файла (кол-во потоков = кол-ву процессоров, уровень сжатия - максимальный)
// * криптование симметричным ключом.
// * заливка на amazon S3.
// * Очистка временной папки.
//
// ### Результат:
//
// * Текущее состояние БД сохранено на amazon S3 в виде нового зашифрованного пресета.
// * Внутри объекта - два файла: пресет и текстовый файл с логом изменений, в который занесен description (изменения писать в форме: кто: что_за_изменения).
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

module.exports = function pushNew(params) {
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

  checkPresetExists(params.name);


  // name=my-preset who=my-name desc=description
};

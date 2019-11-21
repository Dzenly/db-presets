'use strict';

const { readdirSync, mkdirSync } = require('fs');
const { execWithOutput } = require('./lib/exec');

const s3 = require('./lib/s3');
const {
  branchDirArc, branchDirSql, branchDirData, sqlExt,
} = require('../common/consts');
const { decryptUntarXz } = require('./lib/files');
const { createBinData, migrate, restore } = require('./lib/db');


// * Проверяем, что на amazon есть такая директория. Если нет - ругаемся и выходим.

// * Создается (если не было) папка $DBP_PRESETS_DIR.
// * Создается (если не было) папка `$DBP_PRESETS_DIR/<repo>/<branch>/arc` (архивы).
// * Создается (если не было) папка `$DBP_PRESETS_DIR/<repo>/<branch>/sql` (sql скрипты).
// * Создается (если не было) папка `$DBP_PRESETS_DIR/<repo>/<branch>/data` (бинарная data).


// * Останавливается приложение (AUT).

// * В папку стягиваются все (с учетом include/exclude) зашифрованные файлы xz из amazon,
//   которые не существуют в папке, или изменились.
// * Эти новые или изменившиеся файлы расшифровываются.
// * Раз-zx-уются.

// * И дальше в цикле по всем пресетам накатываются (`psql -h 127.0.0.1 -U postgres -f name`),
// накатываются миграции, сохраняются в db-presets-data с помощью pg_basebackup.
// * Останавливается PostgreSQL.

// TODO: не разворачивать в data, параметр.

module.exports = async function pull(params) {
  // `[only=name] [select=name] [prepare-binary]`;

  console.log(`==== Останавливаем приложение с помощью: ${process.env.DBP_APP_STOP} из директории: ${process.env.DBP_APP_WD}`);

  execWithOutput(process.env.DBP_APP_STOP, process.env.DBP_APP_WD);

  console.log('==== Синхронизируем локальные пресеты с облачного сервиса.');
  s3.sync({
    include: params.only,
  });

  const envArcPresets = params.only ? [params.only] : readdirSync(branchDirArc);

  for (const encArcPreset of envArcPresets) {

    await decryptUntarXz(encArcPreset);

    restore(encArcPreset);

    migrate();

    createBinData(encArcPreset);
  }

  console.log('==== Подправляем права доступа на директории с пресетами.');

  execWithOutput(`sudo chgrp -R postgres  ${process.env.DBP_PRESETS_DIR}`);
  execWithOutput(`sudo chmod -R g+u  ${process.env.DBP_PRESETS_DIR}`);

  // TODO: написать что все завершилось успешно?
};

'use strict';

const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = function help(args) {
  if (args[1] === 'env') {
    const envHelp = readFileSync(join(__dirname, '..', 'docs', 'env-vars.md'), 'utf-8');
    console.log(envHelp);
    process.exit(0);
  }

  console.log('Документация тут: https://github.com/Dzenly/db-presets');

  console.log(`Памятка командам и параметрам по параметрам:

add name=<preset-name> creator=<user-name> desc="<preset-description>" - залить пресет на Amazon S3.
gen-key - сгенерить ключ. Запускается один раз на ведро на AWS S3.
get [only=name1,name2] - стянуть пресеты, накатить на них миграции, cохранить бинарники, выбрать последний из указанных в only.
get-lock name=<preset-name> - выдача инфы о блокировке.
init - при смене ветки, создание нужных директорий.
ls where=<local | s3> [short] - листинг Amazon S3 папки с пресетами для репозитория и ветки, заданных в переменных окружения.
reset-lock name=<preset-name> key=<lock-key> - разблочить пресет.
select name=<preset-name> [url=<APPLICATION_URL> [clean] [quietly] - выбор пресета.
set-lock name=my-preset locker=my-name desc=description - блокировка пресета на запись на амазоне.
set-lock name=<preset-name> locker=<my-name> desc="<description>" - залочить пресет.
start-app [url] [quietly] - запустить приложение.
update name=<preset-name> key=<lock-key> updater=<my-name> desc="<description>" - обновление пресета на S3.
what-selected - посмотреть, какой пресет сейчас выбран, и какой у него статус clean.
  `);

  process.exit(0);
};

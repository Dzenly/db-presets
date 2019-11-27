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

  console.log(`Памятка по параметрам:

-h - эта помощь.
-h env - помощь по переменным окружения.

gen-key - сгенерить ключ. Запускается один раз на ведро на AWS S3.
db-p get [only=name1,name2] - стянуть пресеты, накатить на них миграции, cохранить бинарники, выбрать последний из указанных в only.
db-p add name=my-preset creator=my-name desc="some description" - залить пресет на Amazon S3.
db-p set-lock name=my-preset locker=my-name desc=description - блокировка пресета на запись на амазоне.
db-p get-lock name=my-preset - проверка блокировки.
db-p push-ex name=my-preset lock-key=my-key unlocker=my-name desc=description - обновление пресета на S3.
db-p select preset-name clean=yes - выбор пресета.
  `);

  process.exit(0);
};

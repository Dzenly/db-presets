'use strict';

const { readdirSync } = require('fs');
const { branchDirArc } = require('../common/consts');
const { getCurPresetInfo } = require('./lib/files');
const log = require('../logger/logger')('[ls] ');
const s3 = require('./lib/s3');

module.exports = function ls({ where, short }) {
  const { name, clean } = getCurPresetInfo();

  if (!where) {
    log.error('Параметр "where" обязателен.');
    process.exit(1);
  }

  if (where === 's3') {
    if (short) {
      s3.lsCleaned();
    } else {
      s3.ls();
    }
  } else if (where === 'local') {
    const presets = readdirSync(branchDirArc);
    console.log(presets.join('\n'));
  } else {
    log.error(`Некорректное значение для параметра "where": ${where}`);
    process.exit(1);
  }

  console.log(`Информация о выбранном пресете: name: ${name}, clean: ${clean}`);
};

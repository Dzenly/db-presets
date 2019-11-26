'use strict';

const { readdirSync } = require('fs');
const { branchDirArc } = require('../common/consts');
const { getCurPresetInfo } = require('./lib/files');
const logger = require('../logger/logger')('[ls] ');
const s3 = require('./lib/s3');
const { checkCall } = require('./lib/check-params');

module.exports = function ls(params) {
  checkCall('ls', params, ['where']);

  const { where, short } = params;

  const { name, clean } = getCurPresetInfo();

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
    logger.error(`Некорректное значение для параметра "where": ${where}`);
    process.exit(1);
  }

  console.log(`Информация о выбранном пресете: name: ${name}, clean: ${clean}`);
};

'use strict';

const { startApp, stopApp } = require('./lib/app');
const db = require('./lib/db');
const { getCurPresetInfo } = require('./lib/files');
const log = require('../logger/logger')('[select] ');
const { checkBoolean, checkString } = require('./lib/check-params');

module.exports = async function select({
  name, clean, url = process.env.DBP_APP_DEF_URL, quietly,
}) {
  checkString(name, 'name');
  checkBoolean(clean, 'clean');

  log.info(`select(${name}, ${clean}, ${quietly})`);
  const presetInfo = getCurPresetInfo();
  if (presetInfo.name === name) {
    if (presetInfo.clean || !clean) {
      log.verbose(`Пресет "${name}" уже выбран и он чистый либо чистый не требуется`);
      return;
    }
    log.verbose(`Пресет "${name}" уже выбран, но он dirty, а нужен чистый.`);
  }

  log.verbose(`Выбран пресет "${presetInfo.name}", а нужен "${name}".`);

  stopApp(quietly);

  db.restoreBin(name, quietly);

  await startApp(url, quietly);
};

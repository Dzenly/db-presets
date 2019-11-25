'use strict';

const app = require('./lib/app');
const db = require('./lib/db');
const { innerDir } = require('../common/consts');
const { getCurPresetInfo } = require('./lib/files');
const log = require('../logger/logger')('[select] ');

module.exports = async function select({
  name, clean, url = process.env.DBP_APP_DEF_URL, quietly,
}) {
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

  app.stop(quietly);

  db.restoreBin(name, quietly);

  await app.start(url, quietly);
};

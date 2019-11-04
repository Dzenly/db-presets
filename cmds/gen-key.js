'use strict';

const crypto = require('crypto');
const { existsSync, writeFileSync } = require('fs');

const { aesIVLength, aesKeyLength } = require('./lib/consts');

const log = require('../log/logger')('[gen-key] ');

module.exports = function genKey() {
  const keyPath = process.env.DBP_AESKEY_PATH;

  if (!keyPath) {
    console.error('Установите системную переменную DBP_AESKEY_PATH');
    process.exit(1);
  }

  if (existsSync(keyPath)) {
    console.error('Ключ уже существует, если надо перезаписать, то удалите его руками.');
    process.exit(1);
  }

  const iV = crypto.randomBytes(aesIVLength);
  const aesKey = crypto.randomBytes(aesKeyLength);
  const vectorAndKey = Buffer.concat([iV, aesKey]);

  log.verbose('vector and key generated');

  writeFileSync(keyPath, vectorAndKey);
};

'use strict';

const { mkdirSync } = require('fs');
const { innerDir } = require('../cfg/consts');

mkdirSync(innerDir);

if (process.env.DBP_ENV_VARS_PATH) {
  console.log('DBP_ENV_VARS_PATH is set, good!');
} else {
  console.error('Please, set DBP_ENV_VARS_PATH, before db-p usage.');
}

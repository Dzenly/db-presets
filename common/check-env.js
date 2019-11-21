'use strict';

const { execSync } = require('child_process');

if (!process.env.DBP_ENV_VARS_PATH) {
  console.error('Set DBP_ENV_VARS_PATH environment variable.');
  process.exit(1);
}

require(process.env.DBP_ENV_VARS_PATH);

const varNames = [
  'DBP_AESKEY_PATH',
  'DBP_APP_START',
  'DBP_APP_START_WAIT',
  'DBP_APP_STOP',
  'DBP_APP_WD',
  'DBP_BRANCH',
  'DBP_MIGR_CMD',
  'DBP_MIGR_CMD',
  'DBP_MIGR_CMD',
  'DBP_MIGR_WD',
  'DBP_PG_DATA_DIR',
  'DBP_PG_PASSWORD',
  'DBP_PG_START_CMD',
  'DBP_PG_STOP_CMD',
  'DBP_PRESETS_DIR',
  'DBP_REPO',
  'DBP_RO_PROFILE_NAME',
  'DBP_RW_PROFILE_NAME',
  'DBP_S3_BACKET',
  'XZ_OPT',
];

let err = false;

for (const name of varNames) {
  if (!process.env[name]) {
    console.error(`Set ${name} environment variable`);
    err = true;
  }
}

const soft = [
  'tar',
  'xz',
  'pg_dumpall',
  'pg_basebackup',
  'aws',
];

soft.forEach((item) => {
  try {
    execSync(`${item} --version`);
  } catch (e) {
    console.error(`${item} does not exist.`);
    err = true;
  }
});


if (err) {
  process.exit(1);
}

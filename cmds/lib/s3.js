'use strict';

const logger = require('../../log/logger')('[s3] ');
const { exec } = require('./exec');

// Думал сначала юзать aws-sdk, но не нашел там sync.
// Думаю cmd line утилита всегда более свежая и менее глючная, чем SDK.
// К тому же с cmd line работать проще, и документацию по ней смотреть проще.
// const AWS = require('aws-sdk');
// const roCreds = new AWS.SharedIniFileCredentials({profile: process.env.DBP_RO_PROFILE_NAME});
// const rwCreds = new AWS.SharedIniFileCredentials({profile: process.env.DBP_RW_PROFILE_NAME});
// function setROProfile() {
//   AWS.config.credentials = roCreds;
// }
// function setRWProfile() {
//   AWS.config.credentials = rwCreds;
// }
// const s3 = new AWS.S3({apiVersion: '2006-03-01'}});

// const { out, err } = exec(`aws --profile ${process.env.DBP_RO_PROFILE_NAME} s3api head-object --bucket ${process.env.DBP_S3_BACKET} --key ${process.env.DBP_REPO}/${process.env.DBP_BRANCH}/${name}`);

/**
 *
 * @param svc - amason S3 сервис. s3 или s3api.
 * @param cmd - команда.
 * @param access - режим доступа: ro или rw.
 * @param args - доп, аргументы.
 */
exports.execAws = function execAws({
  svc,
  access,
  cmd,
  args,
}) {
  let profile;
  if (access === 'ro') {
    profile = process.env.DBP_RO_PROFILE_NAME;
  } else if (access === 'rw') {
    profile = process.env.DBP_RW_PROFILE_NAME;
  } else {
    throw new Error(`Incorrect access: ${access}`);
  }

  const cmdLine = `aws --profile ${profile} ${svc} ${cmd} --bucket ${process.env.DBP_S3_BACKET} ${args}`;

  logger.verbose(`cmd line: "${cmdLine}"`);

  return exec(cmdLine);
};

/**
 * Ругается и вываливается, если такой пресет уже есть.
 * Ничего не делает, если пресета нет.
 * @param name - имя пресета.
 */
exports.checkPresetAbsent = function checkPresetAbsent(name) {
  const { out, err } = exports.execAws({
    svc: 's3api',
    access: 'ro',
    cmd: 'head-object',
    args: `--key ${process.env.DBP_REPO}/${process.env.DBP_BRANCH}/${name}`,
  });

  if (out) {
    console.error(`Такой пресет уже есть:\n${out}`);
    process.exit(1);
  }

  if (!err.includes('Not Found')) {
    throw new Error(`Непредвиденная ошибка: ${err}`);
  }

};

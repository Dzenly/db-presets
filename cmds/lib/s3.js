'use strict';

const { join } = require('path');

const logger = require('../../log/logger')('[s3] ');
const { execQuietly, execWithOutput } = require('./exec');
const { s3KeyPrefix, branchDirArc } = require('../../common/consts');


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

/**
 *
 * @param svc - amason S3 сервис. s3 или s3api.
 * @param cmd - команда.
 * @param access - режим доступа: ro или rw.
 * @param args - доп, аргументы.
 * @param a
 */
exports.execAws = function execAws({
  svc,
  access,
  cmd,
  args,
  quietly,
}) {
  let profile;
  if (access === 'ro') {
    profile = process.env.DBP_RO_PROFILE_NAME;
  } else if (access === 'rw') {
    profile = process.env.DBP_RW_PROFILE_NAME;
  } else {
    throw new Error(`Incorrect access: ${access}`);
  }

  const cmdLine = `aws --profile ${profile} ${svc} ${cmd} ${args}`;

  logger.verbose(`cmd line: "${cmdLine}"`);

  if (quietly) {
    return execQuietly(cmdLine);
  }
  return execWithOutput(cmdLine);
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
    args: `--bucket ${process.env.DBP_S3_BACKET} --key ${s3KeyPrefix}/${name}`,
    quietly: true,
  });

  if (out) {
    console.error(`Такой пресет уже есть:\n${out}`);
    process.exit(1);
  }

  if (!err.includes('Not Found')) {
    throw new Error(`Непредвиденная ошибка: ${err}`);
  }
};

/**
 * Заливает новый зашифрованный архив файл на S3.
 * @param name
 */
exports.push = function push(name) {
  const arcPath = join(branchDirArc, name);

  exports.execAws({
    svc: 's3',
    access: 'rw',
    cmd: 'cp',
    args: `${arcPath} s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix}/${name}`,
  });
};

exports.ls = function ls() {
  exports.execAws({
    svc: 's3',
    access: 'ro',
    cmd: 'ls',
    args: `--recursive --summarize --human-readable s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix}`,
  });
};

exports.sync = function sync({ include }) {
  const includeParams = include ? `--exclude "*" --include "${include}" ` : '';

  exports.execAws({
    svc: 's3',
    access: 'ro',
    cmd: 'sync',
    args: `--no-progress ${includeParams}--delete s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix} ${branchDirArc}`,
  });
};

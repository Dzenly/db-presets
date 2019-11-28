'use strict';

const { join } = require('path');

const { execQuietly, execWithOutput } = require('./exec');
const { s3KeyPrefix, branchDirArc } = require('../../common/consts');

const logger = require('../../logger/logger')('[s3] ');

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
    logger.error(`Такой пресет уже есть:\n${out}`);
    process.exit(1);
  }

  if (!err.includes('Not Found')) {
    throw new Error(`Непредвиденная ошибка: ${err}`);
  }
};

exports.getMetaData = function getMetaData(name) {
  const { out, err } = exports.execAws({
    svc: 's3api',
    access: 'ro',
    cmd: 'head-object',
    args: `--bucket ${process.env.DBP_S3_BACKET} --key ${s3KeyPrefix}/${name}`,
    quietly: true,
  });

  if (err) {
    logger.error(err.toString());
  }

  if (out) {
    const obj = JSON.parse(out);
    return obj.Metadata;
  }

  logger.error(`Нет такого объекта в Amazon S3: "${s3KeyPrefix}/${name}"`);
  process.exit(1);
};

exports.setMetaData = function setMetaData(name, metaDataObj) {
  const metaDataStr = Object.entries(metaDataObj)
    .map(([key, value]) => `${key}="${value}"`)
    .join(',');

  exports.execAws({
    svc: 's3api',
    access: 'rw',
    cmd: 'put-object',
    args: `--bucket ${process.env.DBP_S3_BACKET} --key ${s3KeyPrefix}/${name} --metadata ${metaDataStr}`,
  });
};

exports.resetMetaData = function resetMetaData(name) {
  exports.execAws({
    svc: 's3api',
    access: 'rw',
    cmd: 'put-object',
    args: `--bucket ${process.env.DBP_S3_BACKET} --key ${s3KeyPrefix}/${name} --metadata {}`,
    quietly: true,
  });
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

exports.ls = function ls(quietly) {
  return exports.execAws({
    svc: 's3',
    access: 'ro',
    cmd: 'ls',
    args: `--recursive --summarize --human-readable s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix}`,
    quietly,
  });
};

exports.lsCleaned = function lsCleaned(quietly) {
  const { out } = exports.execAws({
    svc: 's3',
    access: 'ro',
    cmd: 'ls',
    args: `--recursive --summarize --human-readable s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix}`,
    quietly,
  });

  const arr = out.split('\n')
    .filter((item) => item.includes(s3KeyPrefix))
    .map((item) => {
      const begin = item.indexOf(`${s3KeyPrefix}/`);
      return item.slice(begin + s3KeyPrefix.length + 1);
    })
    .filter((item) => item !== '');

  return arr;
};

/**
 *
 * @param {Array<string>} include
 */
exports.sync = function sync({ include, quietly }) {
  let excludeIncludeStr = '';
  if (include.length) {
    excludeIncludeStr = `--exclude "*" ${include.map((item) => `--include "${item}"`).join(' ')}`;
  }

  logger.verbose('==== Синхронизируем локальные пресеты с облачного сервиса.');
  logger.verbose(`Params: ${excludeIncludeStr}`);

  const retObj = exports.execAws({
    svc: 's3',
    access: 'ro',
    cmd: 'sync',
    args: `--no-progress ${excludeIncludeStr} --delete s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix} ${branchDirArc}`,
    quietly,
  });

  if (retObj) {
    const { out } = retObj;

    const syncedList = (out ? out.split('\n') : [])
      .map((item) => {
        const arr = item.split('/');
        return arr[arr.length - 1];
      }).filter(Boolean);

    return syncedList;
  }
};

exports.isPresetChanged = function isPresetChanged(name) {
  logger.verbose(`==== Проверяем были ли изменения в пресете "${name}".`);

  const { out } = exports.execAws({
    svc: 's3',
    access: 'ro',
    cmd: 'sync',
    args: `--no-progress --dryrun --exclude "*" --include "${name}" --delete s3://${process.env.DBP_S3_BACKET}/${s3KeyPrefix} ${branchDirArc}`,
    quietly: true,
  });

  if (out) {
    logger.warn(`Похоже, в пресете есть изменения на Amazon S3. Сделайте "db-p get only=${name}", чтобы обновить его у себя`);
    logger.info(`aws s3 sync --dryrun output: ${out}`);
    return true;
  }

  return false;
};

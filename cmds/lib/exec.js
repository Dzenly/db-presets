'use strict';

const { rethrow } = require('../../common/consts');
const { execSync } = require('child_process');

/**
 * Запускает команду, и собирает stdout и stderr в переменные.
 * @param cmd - команда.
 * @param cwd - current working dir.
 * @param exceptionOnError - генерить ли исключение при ошибке.
 * @return {{err: *, out: *}} - содержит stdout и stderr.
 * @throws
 */
exports.execQuietly = function execQuietly(cmd, cwd, exceptionOnError) {
  let out;
  let err;

  const opts = {
    windowsHide: true,
    encoding: 'utf8',
    stdio: [
      'ignore',
      'pipe',
      'pipe',
    ],
  };

  if (cwd) {
    opts.cwd = cwd;
  }

  try {
    out = execSync(cmd, opts);
  } catch (e) {
    err = e.toString();
    if (exceptionOnError) {
      rethrow(e);
    }
  }

  return {
    out,
    err,
  };
};

/**
 * Запускает команду, и выводит её stdout и stderr в родительский процесс.
 * Если ошибка - вылетает исключение.
 * @param cmd - команда.
 * @param cwd - current working dir.
 * @throws
 */
exports.execWithOutput = function execWithOutput(cmd, cwd) {
  const opts = {
    windowsHide: true,
    encoding: 'utf8',
    stdio: [
      'inherit',
      'inherit',
      'inherit',
    ],
  };

  if (cwd) {
    opts.cwd = cwd;
  }

  try {
    execSync(cmd, opts);
  } catch (e) {
    rethrow(e);
  }
};

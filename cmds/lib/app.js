'use strict';

const http = require('http');

const { critErrPrefix } = require('../../common/consts');

const { execQuietly, execWithOutput } = require('./exec');

const periodToCheckAppMs = 2000;
const defaultTimeoutMs = 1000 * 60 * 3;

async function waitForAppStart({
  url, // e.g. http://127.0.0.1:1337
  quietly,
  periodMs = periodToCheckAppMs,
  timeoutSec = defaultTimeoutMs,
}
) {
  return new Promise((resolve, reject) => {
    let intervalId;

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      return reject(
        new Error(
          `${critErrPrefix}waitForAppStart: Приложение не запустилось за ${timeoutSec} сек.`
        )
      );
    }, timeoutSec * 1000);

    intervalId = setInterval(() => {
      const req = http.request(`${url}/login`, (response) => {
        if (response.statusCode === 200) {
          if (!quietly) {
            console.log('Приложение запущено.');
          }
          resolve(true);
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        } else if (!quietly) {
          console.log(`Response code: ${response.statusCode}, повторим...`);
        }
      });

      req.on('error', (err) => {
        if (!quietly) {
          console.log(`Error: ${err}`);
        }
      });
      req.end();
    }, periodMs);
  });
}

exports.startApp = async function startApp(url, quietly) {
  const startCmd = process.env.DBP_APP_START;
  const cwd = process.env.DBP_APP_WD;
  if (quietly) {
    execQuietly(startCmd, cwd, true);
    await waitForAppStart({ url, quietly });
    return;
  }
  console.log(`==== Запускаем приложение с помощью: ${startCmd} из директории: ${cwd}`);
  execWithOutput(startCmd, cwd);
  console.log('==== Ожидаем приложение...');
  await waitForAppStart({ url, quietly });
};


exports.stopApp = function stopApp(quietly) {
  const cmd = process.env.DBP_APP_STOP;
  const cwd = process.env.DBP_APP_WD;
  if (quietly) {
    return execQuietly(cmd, cwd, true);
  }
  console.log(`==== Останавливаем приложение с помощью: ${cmd} из директории: ${cwd}`);
  return execWithOutput(cmd, cwd);
};

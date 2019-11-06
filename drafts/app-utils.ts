/// <reference types="tia/types/globals" />

import '/opt/gui-auto-tests/env';

import { execSync } from 'child_process';
import * as http from 'http';

import { EnableLog } from 'tia/types/api/common-types';
import { isLastPresetEqual, restoreBinPreset } from './db-utils';

// Передадутся в дочерние процессы.
process.env.NODE_OPTIONS = '--trace-warnings';
process.env.LOG_LEVEL = 'verbose';
process.env.smp_log__level = 'verbose';
process.env.DZLOGPREFIX_CALLSITE = 'error,warn';

const timeoutToStop = 60 * 1000;
const timeoutToStart = 60 * 1000;

// Подразумевается, что тесты стартуют после деплоя, а значит приложение стартануло.
let appIsStarted = true;

export function isAppStarted() {
  return appIsStarted;
}

export async function stopApp(enableLog?: EnableLog) {
  return gIn.wrap({
    act: async () => {
      gIn.tracer.msg3('stopApp');
      const out = execSync('pm2 delete processes.config.js', {
        cwd: process.env.SMP_DIR,
        timeout: timeoutToStop,
        windowsHide: true,
      });

      appIsStarted = false;

      return out.toString();
    },
    enableLog,
    msg: 'Stopping of R-Vision app ... ',
  });
}

const periodToCheckApp = 3000;
const defaultTimeoutMs = 5 * 60 * 1000;

/**
 *
 * @param periodMs - интервал опроса.
 * @param timeoutMs - таймаут, после которого считать, что приложение не рестартануло по ошибке.
 * TODO: добавить логи сервера в случае ошибки.
 */
async function waitForAppStart(
  periodMs: number = periodToCheckApp,
  timeoutMs: number = defaultTimeoutMs,
) {
  gIn.tracer.msg3('waitForAppStart');
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const req = http.request(`${gT.cLParams.defHost!}/login`, response => {
        if (response.statusCode === 200) {
          gIn.tracer.msg2('Application started.');
          resolve(true);
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        } else {
          gIn.tracer.msg3('Wait.');
        }
      });

      req.on('error', () => {});
      req.end();
    }, periodMs);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      return reject(
        new Error(
          `waitForAppStart: Application did not start for required timeout (${timeoutMs}).`,
        ),
      );
    }, timeoutMs);
  });
}

export async function startApp(enableLog?: EnableLog) {
  return gIn.wrap({
    act: async () => {
      gIn.tracer.msg3('startApp');
      const out = execSync('pm2 start processes.config.js', {
        cwd: process.env.SMP_DIR,
        timeout: timeoutToStart,
        windowsHide: true,
      });

      await waitForAppStart();
      appIsStarted = true;
      return out.toString();
    },
    enableLog,
    msg: 'Starting of R-Vision app ... ',
  });
}

/**
 * Стартует или рестартует приложение с указанным пресетом.
 * Если приложение уже запущено с указанным пресетом и cleanPreset = false, то ничего не происходит.
 * Если приложение не запущено или запущено с другим пресетом, то приложение останавливается,
 * подкладывается чистый пресет, и приложение стартует заново.
 */
export async function startAppWithPreset({
  cleanPreset,
  dbPresetName,
  enableLog,
}: {
  cleanPreset: boolean;
  dbPresetName: string;
  enableLog?: EnableLog;
}) {
  return gIn.wrap({
    act: async () => {
      gIn.tracer.msg3(
        `startAppWithPreset: ${cleanPreset}, ${dbPresetName}, ${enableLog}`,
      );
      if (cleanPreset || !isLastPresetEqual(dbPresetName)) {
        // Требуется чистый пресет, или нужен другой, нужно накатить пресет и рестартануть приложение.
        if (appIsStarted) {
          await stopApp(false);
        }
        await restoreBinPreset(dbPresetName, false);
        await startApp(false);
        return;
      }

      // Не хотят чистый, и пресет совпадает.
      if (!appIsStarted) {
        await startApp(false);
      }
    },
    enableLog,
    msg: `startAppWithPreset (if needed) ${dbPresetName} ... `,
  });
}

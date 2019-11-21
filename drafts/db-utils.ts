/// <reference types="tia/types/globals" />

import { EnableLog } from 'tia/types/api/common-types';

import '/opt/gui-auto-tests/env';

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { basename } from 'path';

const centosPGDir = '/var/lib/pgsql';
const ubuntuPGDir = '/var/lib/postgresql';

let dbDataPath = '';
let stopPGCmdLine = '';
let startPGCmdLine = '';

if (existsSync(centosPGDir)) {
  dbDataPath = '/var/lib/pgsql/11/data/';
  stopPGCmdLine = 'service postgresql-11 stop';
  startPGCmdLine = 'service postgresql-11 start';
} else if (existsSync(ubuntuPGDir)) {
  dbDataPath = '/var/lib/postgresql/11/main/';
  stopPGCmdLine = 'service postgresql stop';
  startPGCmdLine = 'service postgresql start';
} else {
  throw new Error('Unsupported OS');
}

// Должна работать под рутом.
export function stopPG() {
  return execSync(stopPGCmdLine, {
    windowsHide: true,
  });
}

// Должна работать под рутом.
export function startPG() {
  return execSync(startPGCmdLine, {
    windowsHide: true,
  });
}

export function migrationsAndSaveBin(presetName: string) {
  const migrationsOut = execSync('npm run db', {
    cwd: process.env.SMP_DIR,
    windowsHide: true,
  });

  gIn.tracer.msg4(`migrationsOut:\n${migrationsOut.toString()}`);

  const backupOut = execSync(
    `pg_basebackup -h 127.0.0.1 -U postgres -D ${process.env.BIN_DB_PRESETS_DIR}/${presetName}`,
    {
      cwd: process.env.BIN_DB_PRESETS_DIR,
      windowsHide: true,
    },
  );



  gIn.tracer.msg4(`rsyncOut:\n${backupOut.toString()}`);
}

/**
 * Ресторит текстовый пресет, накатывает миграции и, с помощью pg_basebackup,
 * сохраняет бинарный пресет в отдельную папку.
 * Текстовый дамп должен быть создан как pg_dumpall --clean.
 * @param presetName
 * @exeption Error - выкинет эксепшн при ошибках.
 */
export function convertTxtToBin(presetName: string) {
  const restoreOut = execSync(
    `psql -h 127.0.0.1 -U postgres -f ${presetName}.sql`,
    {
      cwd: process.env.TXT_DB_PRESETS_DIR,
      windowsHide: true,
    },
  );

  gIn.tracer.msg4(`restoreOut:\n${restoreOut.toString()}`);

  migrationsAndSaveBin(presetName);
}

/**
 * Ресторит текстовый пресет, накатывает миграции и, с помощью pg_basebackup,
 * сохраняет бинарный пресет в отдельную папку.
 * Текстовый дамп должен быть создан как pg_dumpall --clean.
 * @param presetName
 * @exeption Error - выкинет эксепшн при ошибках.
 */
export function convertAllTxtsToBin() {
  const files = readdirSync(process.env.TXT_DB_PRESETS_DIR!);
  for (const file of files) {
    const presetName = basename(file, '.sql');
    convertTxtToBin(presetName);
  }
}

let lastUsedPreset = ''; // На самом деле какая-то бд есть, которая была на последнем тесте.

/**
 * Ресторит бинарный пресет в течение пары секунд.
 * Rsync-ом синхронизирует директорию data postgresql
 * @param name
 * @exeption Error - выкинет эксепшн при ошибках.
 */
export function restoreBinPreset(name: string, enableLog?: EnableLog) {
  stopPG();
  const rsyncOut = execSync(
    `rsync -aAHXch ${process.env.BIN_DB_PRESETS_DIR}/${name}/ ${dbDataPath} --delete`,
    {
      cwd: process.env.BIN_DB_PRESETS_DIR,
      windowsHide: true,
    },
  );
  gIn.tracer.msg4(`rsyncOut:\n${rsyncOut.toString()}`);
  startPG();
  lastUsedPreset = name;
}

export function isLastPresetEqual(name: string) {
  return lastUsedPreset === name;
}

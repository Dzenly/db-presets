'use strict';

const cp = require('child_process');
const path = require('path');

/* eslint-disable no-console */


exports.tarXzEncrypt = function tarXzEncrypt()


/**
 * Архивирует список директорий и файлов с помощью tar и xz.
 *
 * @param cwd - Текущая рабочая директории.
 * @param dir - Общая директория для всех сабдиректорий и файлов, относительно cwd.
 * @param subdirs - Список директорий для архивации, относительно dir.
 * @param files - Список файлов для архивации, относительно dir.
 * @param artName - Имя архива.
 * @param defaultArtDir - Дефолтная директория для артефактов.
 */
module.exports = function tarXz({cwd, dir, subdirs, files, artName, defaultArtDir}) {

  const pathsToTar = subdirs.concat(files).map(item => path.join(dir, item));

  // cwd, pathsToTar, artName, defaultArtDir
  const artifactsDir = process.env.CI_ART_DIR || defaultArtDir;

  /* eslint-disable-next-line no-param-reassign */
  artName += '.tar.xz';

  console.time(artName);
  console.log(`Creating ${artName}...`);
  cp.execSync(
    'XZ_OPT="-2 -T0" tar --exclude=.git --exclude=.buildkite --exclude=tia-tests --exclude=.idea -cJSf '
    + `${artifactsDir}/${artName} ${pathsToTar.join(' ')}`,
    {
      cwd,
      windowsHide: true,
    }
  );
  console.timeEnd(artName);
};


// const cipher = crypto.createCipheriv(aesAlgName, curKey, curIV);
// let encrypted = cipher.update(data, 'utf8', 'base64');

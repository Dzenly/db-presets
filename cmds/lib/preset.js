'use strict';

const app = require('./app');
const db = require('./db');
const { innerDir } = require('../../common/consts');
const { getCurPresetInfo } = require('./files');

// * TODO: нужно пометить себе на какой пресет переключился.
// * TODO: сделать ф-ю для смены пресета, она же включает рестарт приложения.

// TODO: Лог действий?
// И API: залогируйСтроку.

// usedIntest.
//

exports.selectPreset = function selectPreset(name, clean, quietly) {
  const presetInfo = getCurPresetInfo();

};

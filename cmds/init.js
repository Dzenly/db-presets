'use strict';

const { mkdirSync } = require('fs');
require('../common/consts');

const { checkCall } = require('./lib/check-params');

const {
  innerDir, branchDir, branchDirSql, branchDirArc, branchDirData,
} = require('../common/consts');

module.exports = function init(params) {
  checkCall('init', params);

  mkdirSync(innerDir, { recursive: true });
  mkdirSync(branchDir, { recursive: true });
  mkdirSync(branchDirSql, { recursive: true });
  mkdirSync(branchDirArc, { recursive: true });
  mkdirSync(branchDirData, { recursive: true });

  console.log('Initialization completed.');
};

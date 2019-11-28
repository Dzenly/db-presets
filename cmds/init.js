'use strict';

const { mkdirSync } = require('fs');

const { checkCall } = require('./lib/check-params');

const {
  branchDir, branchDirSql, branchDirArc, branchDirData,
} = require('../common/consts');

module.exports = function init(params) {
  checkCall('init', params);

  mkdirSync(branchDir, { recursive: true });
  mkdirSync(branchDirSql, { recursive: true });
  mkdirSync(branchDirArc, { recursive: true });
  mkdirSync(branchDirData, { recursive: true });

  console.log('Initialization completed.');
};

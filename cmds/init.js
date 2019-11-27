'use strict';

const { mkdirSync } = require('fs');

const {
  branchDir, branchDirSql, branchDirArc, branchDirData,
} = require('../common/consts');

module.exports = function init() {
  mkdirSync(branchDir, { recursive: true });
  mkdirSync(branchDirSql, { recursive: true });
  mkdirSync(branchDirArc, { recursive: true });
  mkdirSync(branchDirData, { recursive: true });

  console.log('Initialization completed.');
};

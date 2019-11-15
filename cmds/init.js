'use strict';

const { mkdirSync } = require('fs');

const { innerDir, branchDir } = require('../common/consts');

module.exports = function init() {
  mkdirSync(innerDir, { recursive: true });
  mkdirSync(branchDir, { recursive: true });
  console.log('Initialization completed.');
};

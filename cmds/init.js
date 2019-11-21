'use strict';

const { mkdirSync } = require('fs');

const { innerDir, branchDir, branchDirSql, branchDirArc, branchDirData } = require('../common/consts');
const { execWithOutput } = require('./lib/exec');

module.exports = function init() {
  mkdirSync(innerDir, { recursive: true });
  mkdirSync(branchDir, { recursive: true });
  mkdirSync(branchDirSql, { recursive: true });
  mkdirSync(branchDirArc, { recursive: true });
  mkdirSync(branchDirData, { recursive: true });
  execWithOutput(`sudo chgrp -R -c postgres  ${process.env.DBP_PRESETS_DIR}`);
  execWithOutput(`sudo chmod -R -c g+u  ${process.env.DBP_PRESETS_DIR}`);
  console.log('Initialization completed.');
};

'use strict';

const { mkdirSync } = require('fs');

const { innerDir, branchDir } = require('../common/consts');

mkdirSync(innerDir, { recursive: true });
mkdirSync(branchDir, { recursive: true });



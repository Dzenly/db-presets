'use strict';

const { mkdirSync } = require('fs');
const { join } = require('path');

const innerDir = join(__dirname, '..', '.inner');

mkdirSync(innerDir);

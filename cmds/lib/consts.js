'use strict';

const { join } = require('path');

exports.aesKeyLength = 256 / 8; // AES Key Length (bytes).
exports.aesAlgName = 'aes256'; // Ciphering algorithm name.
exports.aesIVLength = 128 / 8; // Initialization Vector length (bytes).

exports.changeLogSuffix = '-clog.txt';

exports.innerDir = join(__dirname, '..', '..', '.inner');

'use strict';

const { join } = require('path');

require('./check-env');

const { env } = process;

exports.aesKeyLength = 256 / 8; // AES Key Length (bytes).
exports.aesAlgName = 'aes256'; // Ciphering algorithm name.
exports.aesIVLength = 128 / 8; // Initialization Vector length (bytes).

exports.changeLogSuffix = '-clog.txt';

exports.innerDir = join(__dirname, '..', '..', '.inner');

exports.branchDir = join(env.DBP_PRESETS_DIR, env.DBP_REPO, env.DBP_BRANCH);
exports.branchDirArc = join(exports.branchDir, 'arc');
exports.branchDirSql = join(exports.branchDir, 'sql');
exports.branchDirData = join(exports.branchDir, 'data');

exports.arcExt = '.tar.xz';
exports.sqlExt = '.sql';

exports.s3KeyPrefix = `${process.env.DBP_REPO}/${process.env.DBP_BRANCH}`;

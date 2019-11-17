'use strict';

const { execSync } = require('child_process');

exports.exec = function exec(cmd, cwd) {
  let out;
  let err;

  const opts = {
    windowsHide: true,
    encoding: 'utf8',
    stdio: [
      'ignore',
      'pipe',
      'pipe',
    ],
  };

  if (cwd) {
    opts.cwd = cwd;
  }

  try {
    out = execSync(cmd, opts);
  } catch (e) {
    err = e.toString();
  }

  return {
    out,
    err,
  };
};

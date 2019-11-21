'use strict';

const { execSync } = require('child_process');

exports.execQuietly = function execQuietly(cmd, cwd) {
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

exports.execWithOutput = function execWithOutput(cmd, cwd) {
  const opts = {
    windowsHide: true,
    encoding: 'utf8',
    stdio: [
      'inherit',
      'inherit',
      'inherit',
    ],
  };

  if (cwd) {
    opts.cwd = cwd;
  }

  try {
    execSync(cmd, opts);
  } catch (e) {
    console.error(e.toString());
    process.exit(1);
  }
};

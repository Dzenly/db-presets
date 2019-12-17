'use strict';

if (!process.env.DBP_NO_POSTINSTALL) {
  const init = require('../cmds/init');
  init();
}

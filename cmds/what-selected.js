'use strict';

const { checkCall } = require('./lib/check-params');
const { getCurPresetInfoStr } = require('./lib/files');

module.exports = function whatSelected(params) {
  checkCall('what-selected', params);
  console.log(getCurPresetInfoStr());
};

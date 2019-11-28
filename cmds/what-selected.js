'use strict';

const { checkCall } = require('./lib/check-params');
const { getCurPresetInfStr } = require('./lib/files');

module.exports = function whatSelected(params) {
  checkCall('what-selected', params);
  console.log(getCurPresetInfStr());
};

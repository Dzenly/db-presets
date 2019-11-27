'use strict';

process.env.TZ = 'UTC';

const [,, ...args] = process.argv;

if (!args.length) {
  args.push('h');
}

if (args[0] === '-h') {
  args[0] = 'h';
}

const params = args.slice(1);

const objParams = {};

params.forEach((param) => {
  const [key, value = true] = param.split('=');
  objParams[key] = value;
});

require(`../cmds/${args[0]}`)(objParams);

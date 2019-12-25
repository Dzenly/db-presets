#!/usr/bin/env node

// ':' //# comment; exec /usr/bin/env node "$0" "$@"

process.env.TZ = 'UTC';

process.on('unhandledRejection', () => {
  process.exit(1);
});

require('../common/consts');

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

try {
  require(`../cmds/${args[0]}`)(objParams);
} catch (e) {
  console.error(`Наверное, такой команды не существует: "${args[0]}"`);
  require('../cmds/h')({});
  console.error(e);
  process.exit(1);
}

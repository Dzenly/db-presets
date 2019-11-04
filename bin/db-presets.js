'use strict';

const [,, ...args] = process.argv;

if (!args.length) {
  args.push('-h');
}

require(`../cmds/${args[0]}`)(args);

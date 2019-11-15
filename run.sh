#!/usr/bin/env bash

export DBP_ENV_VARS_PATH=/home/alexey/projects/myGithub/node_modules1/db-presets/cfg/cfg-no-git.js

node bin/db-presets.js $*

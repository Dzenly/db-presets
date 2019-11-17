#!/usr/bin/env bash

aws --profile r-vision-r s3api $*
--bucket rv-db-presets --key r-vision/4.1/asf
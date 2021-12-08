#!/usr/bin/env bash

FILES="./stacks/*.yml"
for f in $FILES
do
# FAILSAFE #
# Check if "$f" FILE exists and is a regular file #
  if [ -f "$f" ]
  then
    npx org-formation validate-stacks $f
  else
    echo "Warning: unable to validate \"$f\""
  fi
done
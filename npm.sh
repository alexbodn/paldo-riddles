#!/bin/sh

# or run
# ROOT_DIR=`dirname \`readlink -f package.json\`` NODE_LOCAL=`pwd`/node_modules/ NODE_PATH=${NODE_LOCAL}:${NODE_PATH} npm start

export PJ=`readlink -f package.json`
export ROOT_DIR=`dirname ${PJ}`
export NODE_LOCAL=`pwd`/node_modules/
export NODE_PATH=${NODE_LOCAL}:${NODE_PATH}

if [ "$1" = "--help" ]; then
  echo ROOT_DIR=${ROOT_DIR}
  echo NODE_LOCAL=${NODE_LOCAL}
  #echo NODE_PATH=${NODE_PATH}
  npm run
fi

npm $1 $2 $3 $4 $5
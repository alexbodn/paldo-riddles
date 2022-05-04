'use strict';

var testers = [
  'Arguments',
  'Function',
  'String',
  'Number',
  'Date',
  'RegExp'
].reduce( (obj, name) => {
  obj[ 'is' + name ] = x => x.constructor.name === name;
  return obj;
}, {});

testers.isArray = x => Array.isArray(x);
testers.isBoolean = x => [true, false].includes(x);

module.exports = testers;

'use strict';

var testers = [
  'Arguments',
  'Function',
  'String',
  'Number',
  'Date',
  'RegExp'
].reduce( (obj, name) => {
  obj[ 'is' + name ] = x => x && x.constructor.name === name;
  return obj;
}, {});

testers.isArray = x => Array.isArray(x);
testers.isBoolean = x => [true, false].includes(x);
testers.isObject = x =>
  (!!x && typeof x === 'object' && !Array.isArray(x) && !testers.isFunction(x));
testers.isPrimitive = x => (x === null || !["object", "function"].includes(typeof x));

module.exports = testers;

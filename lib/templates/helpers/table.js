'use strict';

const { table } = require('elementbuilder');

module.exports = function(data, context) {
  let rendered = table(data);
  return rendered;
};

'use strict';

const { table_form } = require('elementbuilder');

module.exports = function(element, context) {
  let rendered = table_form(element);
  //console.log(element, rendered);
  return rendered;
};

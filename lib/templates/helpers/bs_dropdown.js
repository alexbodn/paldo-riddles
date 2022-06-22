'use strict';

const { bs_dropdown } = require('elementbuilder');

module.exports = function(element, label, id, labeledby, context) {
  let rendered = bs_dropdown({
    __id: id, __label: label, __labeledby: labeledby, __elements: element
  });
  //console.log(element, rendered);
  return rendered;
};

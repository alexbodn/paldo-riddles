const { labeled_form } = require('elementbuilder');

module.exports = function(element, context) {
  let rendered = labeled_form(element);
  //console.log(element, rendered);
  return rendered;
};

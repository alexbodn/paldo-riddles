const { form_field } = require('elementbuilder');

module.exports = function(element, context) {
  let rendered = form_field(element);
  //console.log(element, rendered);
  return rendered;
};

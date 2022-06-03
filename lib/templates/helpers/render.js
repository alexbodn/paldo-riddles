const { render } = require('elementbuilder');

module.exports = function(element, context) {
  let rendered = render(element);
  //console.log(element, rendered);
  return rendered;
};

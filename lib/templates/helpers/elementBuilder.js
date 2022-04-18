'use strict';
// element builder
// build an html element with attributes as given


var testers = require('./whatobj');

const text_val = ['html', 'text'];
const no_attr = ['tag', ...text_val,];
const empty_val = [null, undefined];

const self_closing_tags = {
  src: false,
  input: true,
};

function select_options(element, val) {
  if (!testers.isArray(val)) {
    val = [val];
  }
  if (!element.multiple) {
    val = [val[0]];
  }
  let options = element.options.map(function(option) {
    var value = false;
    if (!testers.isArray(option)) {
      value = option;
      option = [false, option];
    }
    else {
      if (!option.length) {
        return '';
      }
      else if (option.length < 2) {
        value = option;
        option = [false, option[0]];
      }
      else {
        value = option[0];
      }
    }
    let one = {tag: 'option', value: option[0], text: option[1]};
    if (val.includes(value)) {
      one.selected = true;
    }
    return '\n' + render(one);
  });
  delete element.options;
  element.html = options.reduce((acc, curr) => {return acc + curr;}) + '\n';
}

function input(element, val) {
  if (element.type == 'radio' || testers.isArray(val) ||
      element.options && element.options.length) {
    const nval = testers.isArray(val) ?
      ((element.multiple && val.length > 1) ? val : [val[0]]) : [val];
    const type = element.multiple ? 'checkbox' : 'radio';
    let options = element.options.map(function(option) {
      if (!testers.isArray(option)) {
        option = [option, option];
      }
      else {
        if (!option.length) {
          return '';
        }
        else if (option.length < 2) {
          option = [option[0], option[0]];
        }
      }
      let input = {
        tag: 'input',
        type: type,
        name: element.name,
        value: option[0],
        checked: nval.includes(option[0]),
      };
      return '\n' + render({
        tag: 'label',
        text: render(input) + render({tag: 'span', text: option[1]}),
      });
    });
    element.strip = true;
    element.html = options.reduce((acc, curr) => {return acc + curr;}) + '\n';
  }
  else if (element.type == 'checkbox') {
    element.checked = !!(testers.isArray(val) ? val[0] : val);
  }
  else {
    element.value = val; // no problem with array value
  }
}

const val_attr = {
  textarea: ['text', 'html',],
  input: input,
  select: select_options,
};

function setval(element, val) {
  var nval = val_attr[element.tag];
  if (testers.isString(nval)) {
    nval = [nval];
  }
  if (testers.isArray(nval)) {
    for (const field of nval) {
      element[field] = val;
    }
  }
  if (testers.isFunction(nval)) {
    nval(element, val);
  }
}

var render = (element) => {
    var text = (element.html || element.text || '');
    if (element.strip) {
      return text;
    }
    const tag = element.tag;
    var html = '<' + tag;
    let attribs = Object.entries(element).filter(one_pair => {
      return !no_attr.includes(one_pair[0]);
    });
    for (const [attr, value] of attribs) {
        if (value === false) {
          continue;
        }
        let val = value !== true ? value : attr;
        if (testers.isArray(val)) {
          val = val.join(' ');
        }
        val = JSON.stringify(empty_val.includes(val) ? '' : val.toString());
        html += ' ' + attr + '=' + val;
    }
    let self_closing = (tag in self_closing_tags) ? self_closing_tags[tag] : !text;
    if (self_closing) {
      html += ' /';
    }
    html += '>';
    if (!self_closing) {
      html += (text + '</' + tag + '>');
    }
    return html;
};

function form_field(element) {
    var elem = Object.assign(element);
    var val = '';
    if ('__val' in elem) {
      val = elem.__val;
      delete elem.__val;
    }
    setval(elem, val);
    var label = '';
    if ('__label' in elem) {
      label = elem.__label;
      delete elem.__label;
    }
    var text = render(elem);
    if (label) {
      label = {
        tag: 'label',
        'class': '__class' in label ? label.__class : false,
        'id': '__id' in label ? label.__id : false,
        text: render({tag: 'span', text: label.__label}) + text,
      };
      text = render(label);
    }
    return text;
}

module.exports = function(element, context) {
  return form_field(element);
};

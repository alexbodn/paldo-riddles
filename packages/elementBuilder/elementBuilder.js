'use strict';
// element builder
// build an html element with the given tag and attributes


const {isArray, isString, isFunction, isObject} = require('whatobj');

const self_closing_tags = {
  src: false,
  input: true,
  textarea: false,
  div: false,
};

const render = (element) => {
    if (!element) {
      return '';
    }
    if (isArray(element)) {
      let ret = element.map(render).reduce((acc, curr) => {return acc + '\n' + curr;}, '');
      return ret + '\n';
    }
    if (isString(element)) {
      return element;
    }
    var {tag, html, text, __class, __id, ...attribs} = element;
    text = html || text || '';
    if (isObject(text)) {
      text = JSON.stringify(text, null, 2);
    }
    if (element.strip) {
      return text;
    }
    html = '<' + tag;
    Object.assign(attribs, {
      'class': __class || false,
      'id': __id || false,
    });
    for (const [attr, value] of Object.entries(attribs)) {
        if (value === false) {
          continue;
        }
        let val = value !== true ? value : attr;
        if (isArray(val)) {
          val = val.join(' ');
        }
        if (val && !isObject(val)) {
          val = val.toString();
        }
        val = JSON.stringify(val || '');
        if (!val.startsWith('"')) {
          val = "'" + val.replace("'", "\\'") + "'";
        }
        html += ' ' + attr + '=' + val;
    }
    let self_closing = (tag in self_closing_tags) ? self_closing_tags[tag] : !text;
    if (self_closing) {
      html += ' />';
    }
    else {
      html += ('>' + text + '</' + tag + '>');
    }
    return html;
};

function select_options(element, val) {
  if (!isArray(val)) {
    val = [val];
  }
  if (!element.multiple) {
    val = [val[0]];
  }
  let options = element.options.map(function(option) {
    var value = false;
    if (!isArray(option)) {
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
    return render(one);
  });
  delete element.options;
  element.html = render(options);
}

function input(element, val) {
  if (element.type == 'radio' || isArray(val) ||
      element.options && element.options.length) {
    const nval = isArray(val) ?
      ((element.multiple && val.length > 1) ? val : [val[0]]) : [val];
    const type = element.multiple ? 'checkbox' : 'radio';
    let options = element.options.map(function(option) {
      if (!isArray(option)) {
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
        disabled: !!element.disabled || !!element.readonly,
        checked: nval.includes(option[0]),
      };
      return render({
        tag: 'label',
        text: render(input) + render({tag: 'span', text: option[1]}),
      });
    });
    element.strip = true;
    element.html = render(options);
  }
  else if (element.type == 'checkbox') {
    element.checked = !!(isArray(val) ? val[0] : val);
    element.value = 1; // beware, when not checked, will be missing
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
  if (isString(nval)) {
    nval = [nval];
  }
  if (isArray(nval)) {
    for (const field of nval) {
      element[field] = val;
    }
  }
  if (isFunction(nval)) {
    nval(element, val);
  }
}

const table = (data) => {
  // receives an array of rows, each being an object of cells named by columns,
  // and optionally an array of columns, to have them specified and ordered,
  // columns may be names, or objects of {__label, __name}
  var {__rows, __columns, __th_style, __td_style, ...attribs} = data;
  if (!__columns || !__columns.length) {
    if (__rows.length > 0 && __columns !== false) {
      __columns = Object.keys(__rows[0]);
    }
    else {
      __columns = [];
    }
  }
  function tr(cells, tag, attribs) {
    let ret = {
      tag: 'tr',
      text: render(cells.map(cell => {
        return Object.assign({
          tag: tag || 'td',
          text: render(isObject(cell) && '__label' in cell ? cell.__label : cell),
        }, attribs || {});
      }))
    };
    return ret;
  }
  let table = Object.assign(
    attribs, {
      tag: 'table',
      text: render((__columns.length ? [tr(__columns, 'th', {style: __th_style || ''})] : []).concat(
        __rows.map(row => {
          return tr(!__columns.length ? Object.values(row) :
            __columns.map(column => {
              let key = isObject(column) && '__name' in column ? column.__name : column;
              return row[key];
              }), 'td', {style: __td_style || ''});
        })
      ))
    }
  );
  return render(table);
};

const form_field = (element) => {
    var {__val, __label, __errmsg, ...elem} = element;
    setval(elem, __val || '');
    var text;
    var label = __label;
    if (label) {
      const {__class, __id, __label} = label;
      text = [{
        tag: 'label',
        __class: __class,
        __id: __id,
        text: render([{tag: 'span', text: __label}, elem]),
      }];
    }
    else {
      text = [elem];
    }
    if (elem.name) {
      text.push({
        tag: 'div',
        __class: `errmsg ${elem.name}`,
        text: __errmsg || '',
      });
    }
    return render(text);
};

const labeled_form = (element) => {
  let {__fields, __submit, ...form} = element;
  __fields = Object.entries(__fields).map(field => {
    let baseObj =
      ((field[1].type || '').toLowerCase() == 'hidden') ? {} :
      {__label: {__label: field[0] + ': ', __class: 'field_label'}};
    return Object.assign(baseObj, field[1]);
  });
  __fields.push({
    tag: 'input',
    type: 'submit',
    __val: __submit || 'submit',
  });
  Object.assign(form, {
    tag: 'form',
    text: render(__fields.map(field => {
      return {tag: 'div', text: form_field(field)};
    }))
  });
  return render(form);
};

const table_form = (element) => {
  let {__fields, __submit, ...form} = element;
  let visible_fields = Object.entries(__fields)
    .filter(field => (field[1].type || '').toLowerCase() != 'hidden')
    .map(field => {
      return {
        label: {tag: 'span', text: field[0] + ':', 'class': 'field_label'},
        value: form_field(field[1]),
      };
    });
  let hidden_fields = Object.entries(__fields)
    .filter(field => (field[1].type || '').toLowerCase() == 'hidden')
    .map(field => field[1]);
  visible_fields.push({
    label: '',
    value: hidden_fields.concat([
      {tag: 'input', type: 'submit', value: __submit || 'submit'}]),
  });
  Object.assign(form, {
    tag: 'form',
    text: '\n' + render(table({__rows: visible_fields})) + '\n'
  });
  return render(form);
};

module.exports = {
  table: table,
  render: render,
  form_field: form_field,
  table_form: table_form,
  labeled_form: labeled_form,
};

'use strict';

const Schwifty = require('@hapipal/schwifty');
const {isArray, isPrimitive} = require('whatobj');

exports.Model = class extends Schwifty.Model {

    static createNotFoundError(ctx) {

        const error = super.createNotFoundError(ctx);

        return Object.assign(error, {
            modelName: this.name
        });
    }
};

const Joi = require('joi');

exports.JOI = class {
    static splitArray(value, helpers) {
      return isArray(value) ? value : value.split(',');
    }

    static joinArray(value, helpers) {
      return isArray(value) ? value.join(',') : value;
    }

    static dictString(value, helpers) {
      if (value) {
        try {
          var obj = JSON.parse(value);
          for (var val of Object.values(obj)) {
            if (!isPrimitive(val)) {
              throw 'should be a dictionary of primitives';
            }
          }
          value = JSON.stringify(obj);
        }
        catch (error) {
          value = helpers.error('any.custom', {error: error});
        }
      }
      else {
        value = null;
      }
      return value;
    }

    static scope() {
      return Joi.alternatives()
          .try(Joi.array().items(Joi.string()), Joi.string())
          .default('client')
          .custom(this.joinArray);
    }

};

exports.scopes_actions = (info, scopes, request) => {
    let path = request ? request.path : '';
    return scopes.map(scope => {
        return info[scope].menu_options;
    }).reduce((left, right) => {
        return left.concat(right);
    }, [])
    //.filter(element => {return element.href != path;})
    .map(action => {
      if (action.href == path) {
        return {
          tag: 'span',
          __class: 'current-path',
          text: action.text,
        };
      }
      if (request && action.href == '/logout') {
          let { ...maction } = action;
          let url = new URL(`${request.url.origin}/logout`);
          url.searchParams.append('came_from', request.url.href);
          maction.href = url.href;
          return maction;
      }
      else {
          return action;
      }
    });
};


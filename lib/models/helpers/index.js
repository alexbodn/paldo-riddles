'use strict';

const Schwifty = require('@hapipal/schwifty');

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
      return Array.isArray(value) ? value : value.split(',');
    }

    static joinArray(value, helpers) {
      return Array.isArray(value) ? value.join(',') : value;
    }

    static nullableInt(value, helpers) {
        value = value ? parseInt(value) : NaN;
        return isNaN(value) ? null : value;
    }

    static scope() {
      return Joi.alternatives()
          .try(Joi.array().items(Joi.string()), Joi.string())
          .default('client')
          .custom(this.joinArray);
    }

};


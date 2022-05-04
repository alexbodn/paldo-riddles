'use strict';

const Joi = require('joi');
const { Model, JOI } = require('./helpers');

module.exports = class Robot extends Model {
    static tableName = 'Robots';
    static joiSchema = Joi.object({
        id: Joi.number().integer().greater(0),
        // url to send the jwt to
        url: Joi.string().uri().required(),
        // optional
        username: Joi.string().required(),
        password: Joi.binary(),
        info: Joi.string().empty('').allow(null).default(null),
        scope: JOI.scope(),
        // how many secs to refresh the jwt before it expires
        autho_refresh: Joi.custom(JOI.nullableInt),
    });
};

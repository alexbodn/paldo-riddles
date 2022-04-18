'use strict';

const { Model } = require('./helpers');
const Joi = require('joi');

module.exports = class Riddles extends Model {
    static tableName = 'Riddles';
    static joiSchema = Joi.object({
        id: Joi.number().integer(),
        slug: Joi.string(),
        question: Joi.string(),
        answer: Joi.string()
    });
};

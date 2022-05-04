'use strict';

const Joi = require('joi');
const { Model, JOI } = require('./helpers');

module.exports = class JWT extends Model {
    
    static tableName = 'jwts';
    
    static joiSchema = Joi.object({
      id: Joi.number().integer().greater(0),
      service: Joi.string(),
      owner: Joi.number().integer().greater(0),
      iat: Joi.number(), // issued at timestamp
      exp: Joi.number(), // expiry timestamp
      rvk: Joi.number(), // revoked at timestamp
      // refresh automatically after this time, if not null
      autho_refresh: Joi.custom(JOI.nullableInt),
      // secs not to delete the record after exp:
      keep_after_exp: Joi.custom(JOI.nullableInt),
      // jwt to revoke the moment this is used
      replaces: Joi.custom(JOI.nullableInt),
      attempts_after_rvk: Joi.number(),
      comment: Joi.string(),
    });
    
    static get relationMappings() {
      return {
        replaced: {
          relation: Model.BelongsToOneRelation,
          modelClass: JWT,
          join: {
            from: 'jwts.replaces',
            to: 'jwts.id'
          }
        },
      };
    }
};

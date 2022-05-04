'use strict';

const Joi = require('joi');
const { Model, JOI } = require('./helpers');

module.exports = class User extends Model {

    static tableName = 'Users';

    static joiFields = {
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password: Joi.binary(),
        bio: Joi.string().empty('').allow(null).default(null),
        image: Joi.string().uri().empty('').allow(null).default(null),
        phone: Joi.string(),
        sms: Joi.string(),
        scope: JOI.scope(),
        // how many secs to refresh the jwt before it expires
        autho_refresh: Joi.custom(JOI.nullableInt),
    };
    
    static joiPasswordUpdate = {
        password: Joi.string(),
        password_confirm: Joi.when('password', {
            not: '',
            //is: Joi.exist(),
            then: Joi.valid(Joi.ref('password')),
            //otherwise: true
        }),
        password_current: Joi.when('password', {
            not: '',
            //is: Joi.exist(),
            then: Joi.required(),
            //otherwise: Joi.allow('')
        }),
    };
    
    static joiSchema =
      Joi.object(User.joiFields)
      .options({ stripUnknown: true });

    static get relationMappings() {

        return {
            following: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'Users.id',
                    through: {
                        from: 'Followers.followerId',
                        to: 'Followers.userId'
                    },
                    to: 'Users.id'
                }
            },
            followedBy: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'Users.id',
                    through: {
                        from: 'Followers.userId',
                        to: 'Followers.followerId'
                    },
                    to: 'Users.id'
                }
            }
        };
    }
};

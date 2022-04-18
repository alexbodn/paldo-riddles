'use strict';

const Joi = require('joi');
const { Model } = require('./helpers');

module.exports = class User extends Model {

    static tableName = 'Users';

    static ensure_array(value, helpers) {
      return Array.isArray(value) ? value : value.split(',');
    }

    static joiSchema = Joi.object({
        id: Joi.number().integer().greater(0),
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password: Joi.binary(),
        bio: Joi.string().empty('').allow(null).default(null),
        image: Joi.string().uri().empty('').allow(null).default(null),
        phone: Joi.string(),
        sms: Joi.string(),
        scope: Joi.alternatives()
          .try(Joi.array().items(Joi.string()), Joi.string())
          .default(['client'])
          .custom(this.ensure_array, 'always string array'),
    });

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

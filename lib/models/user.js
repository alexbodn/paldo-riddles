'use strict';

const Joi = require('joi');
const { Model, JOI, scopes_actions } = require('./helpers');

const scopes_info_content = {
    client: {
      menu_options: [
        {tag: 'a', href: '/current', text: 'current'},
        {tag: 'a', href: '/logout', text: 'logout'},
        {tag: 'a', href: '/messages', text: 'messages'},
      ],
    },
    guest: {
      menu_options: [
        {tag: 'a', href: '/signup', text: 'signup'},
        {tag: 'a', href: '/login', text: 'login'},
      ],
    },
    admin: {
      menu_options: [
        {tag: 'a', href: '/robots', text: 'robots'},
      ],
    },
};
      
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
        autho_refresh: Joi.number().integer().empty('').allow(null).default(null)
    };
    
    static joiPasswordCreate = {
        password: Joi.string().required(),
        password_confirm: Joi.valid(Joi.ref('password')),
    };
    
    static joiPasswordUpdate = {
        password: Joi.string().allow(''),
        password_confirm: Joi.when('password', {
            not: '',
            //is: Joi.exist(),
            then: Joi.valid(Joi.ref('password')),
            //otherwise: true
        }),
        password_current: Joi.when('password', {
            not: '',
            //is: Joi.exist(),
            then: Joi.string().required(),
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
    
    static scopes_info() {
      return scopes_info_content;
    }
    
    static scopes_actions(scopes, request) {
      return scopes_actions(scopes_info_content, scopes, request);
    }

    static fieldsCreate() {
        var fields = {
            email: {tag: 'input', type: 'email'},
            password: {tag: 'input', type: 'password'},
            password_confirm: {tag: 'input', type: 'password'},
            username: {tag: 'input', type: 'text'},
            bio: {tag: 'textarea'},
            image: {tag: 'input', type: 'url'},
            phone: {tag: 'input', type: 'tel'},
            sms: {tag: 'input', type: 'tel'},
            scope: {tag: 'input', type: 'radio', options: ['client'], disabled: true, multiple: true},
            autho_refresh: {tag: 'input', type: 'number', readonly: true},
            //scope: {tag: 'input', type: 'text', readonly: true},
            //scope: {tag: 'select', options: Object.keys(scopes_info), multiple: true},
        };
        for (var [key, val] of Object.entries(fields)) {
            val.name = key;
        }
        
        return fields;
    }
    
    static fieldsEdit() {
        var fields = {
            email: {tag: 'input', type: 'email'},
            password: {tag: 'input', type: 'password'},
            password_confirm: {tag: 'input', type: 'password'},
            password_current: {tag: 'input', type: 'password'},
            username: {tag: 'input', type: 'text'},
            bio: {tag: 'textarea'},
            image: {tag: 'input', type: 'url'},
            phone: {tag: 'input', type: 'tel'},
            sms: {tag: 'input', type: 'tel'},
            scope: {
              tag: 'input', type: 'radio',
              options: Object.keys(User.scopes_info()),
              multiple: true
            },
            autho_refresh: {tag: 'input', type: 'number'},
            //scope: {tag: 'input', type: 'text', readonly: true},
            //scope: {tag: 'select', options: Object.keys(scopes_info), multiple: true},
        };
        for (var [key, val] of Object.entries(fields)) {
            val.name = key;
        }
        return fields;
    }
            
};

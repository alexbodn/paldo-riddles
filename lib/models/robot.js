'use strict';

const Joi = require('joi');
const { Model, JOI, scopes_actions } = require('./helpers');

const scopes_info_content = {
    twilio_bringer: {
      menu_options: [
        {tag: 'a', href: "/robots/jwt_give/{id}", text: 'jwt give'},
      ],
    },
};
      
module.exports = class Robot extends Model {
    static tableName = 'Robots';
    
    static joiFields = {
        // url to send the jwt to
        // the url may contain {xx} fields, hence no uri validation
        url: Joi.string()./*uri().*/required(),
        contentType: Joi.string().allow(''),
        //headers: Joi.string().allow(''),
        headers: Joi.custom(JOI.dictString, 'string of dict of primitives')
          .messages({'any.custom': '{{#error.message}}'}),
        // optional
        username: Joi.string().required(),
        password: Joi.binary(),
        info: Joi.string().empty('').allow(null).default(null),
        scope: JOI.scope(),
        // how many secs to refresh the jwt before it expires
        autho_refresh: Joi.number().integer().empty('').allow(null).default(null)
          .messages({
            'number.base': 'חייב להיות מספר שלם'
          }),
    };
    
    static joiPasswordWeb = {
        password: Joi.string().allow(''),
        password_confirm: Joi.valid(Joi.ref('password')),
    };
    
    static joiSchema =
      Joi.object(Robot.joiFields)
        .options({ stripUnknown: true });

    static editFields() {

        var fields = {
            username: {tag: 'input', type: 'text'},
            url: {tag: 'input', type: 'urll'},
            contentType: {tag: 'input', type: 'text'},
            headers: {tag: 'textarea'},
            password: {tag: 'input', type: 'password'},
            password_confirm: {tag: 'input', type: 'password'},
            info: {tag: 'textarea'},
            scope: {
              tag: 'input', type: 'radio',
              options: Object.keys(Robot.scopes_info()),
              multiple: true
            },
            autho_refresh: {tag: 'input', type: 'text'},
        };
        
        for (var [key, val] of Object.entries(fields)) {
            val.name = key;
        }
        
        return fields;
    }

    static scopes_info() {
      return scopes_info_content;
    }
    
    static scopes_actions(scopes, request) {
      return scopes_actions(scopes_info_content, scopes, request);
    }

};

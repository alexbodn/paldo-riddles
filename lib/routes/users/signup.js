'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const User = require('../../models/user');

module.exports = Helpers.withDefaults([
    {
        method: 'get',
        path: '/signup',
        options: {
            auth: false,
            handler: async (request, h) => {

                const { userService, displayService } = request.services();
                const scopes_info = userService.scopes_info();
                
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
                
                var defaults = {
                  scope: 'client',
                };
                
                for (var [key, val] of Object.entries(fields)) {
                    val.__label = {__label: key + ': ', __class: 'field_label'};
                    val.__val = (key in defaults) ? defaults[key] : '';
                    val.name = key;
                }
                console.log(fields)

                return h.view('user', {
                    title: 'signup', action: '/users', method: 'POST',
                    fields: fields
                });
            }
        }
    },
    {
        method: 'post',
        path: '/users',
        options: {
            validate: {
                payload: Joi.object(Object.assign({},
                  User.joiFields,
                  {
                    password: Joi.string().required(),
                    password_confirm: Joi.valid(Joi.ref('password')),
                  },
//                  User.joiPasswordConfirm,
                ))
                .options({ stripUnknown: true })
                    /*//user: Joi.object().required().keys({
                        email: User.field('email').required(),
                        password: Joi.string().required(),
                        password_confirm: Joi.valid(Joi.ref('password')),
                        username: User.field('username').required(),
                        bio: User.field('bio'),
                        image: User.field('image'),
                        phone: User.field('phone'),
                        sms: User.field('sms').required()
                    //})
                //})*/
            },
            auth: false,
            handler: async (request, h) => {

                //const { user: userInfo } = request.payload;
                const userInfo = request.payload;
                console.log('users post:', userInfo)
                const { userService, displayService } = request.services();

                const signupAndFetchUser = async (txn) => {

                    const id = await userService.signup(userInfo, txn);

                    return await userService.findById(id, txn, true);
                };

                const user = await h.context.transaction(signupAndFetchUser);
                const { email, password } = userInfo;

                const response = h.response();
                
                const login = async (txn) => {
                    return await userService.login({ email, password }, txn, response);
                };

                await h.context.transaction(login);

                response.redirect('/current');
                return response;
            }
        }
    }
]);

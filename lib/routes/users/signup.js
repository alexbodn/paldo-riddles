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

                var fields = User.fieldsCreate();
                
                var defaults = {
                  scope: 'client',
                };
                
                for (var [key, val] of Object.entries(fields)) {
                    val.__val = (key in defaults) ? defaults[key] : '';
                }

                const form = {
                  action: '/users', method: 'POST', __fields: fields,
                };
                
                return h.view('user', {
                    title: 'signup', form: form,
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
                    User.joiPasswordCreate,
                  ))
                  .options({ stripUnknown: true })
            },
            auth: false,
            handler: async (request, h) => {

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

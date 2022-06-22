'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const User = require('../../models/user');

module.exports = Helpers.withDefaults([
    {
        method: 'get',
        path: '/login',
        options: {
            auth: {
              mode: 'try',
            },
            handler: async (request, h) => {
    
                let goto = request.query.came_from || '/current';
                let auth = request.auth;
                if (auth && auth.credentials.scope.includes('client')) {
                  return h.redirect(goto);
                }
                
                var fields = {
                    email: {tag: 'input', type: 'email', name: 'email'},
                    password: {tag: 'input', type: 'password', name: 'password'},
                    came_from: {
                      tag: 'input',
                      type: 'hidden',
                      name: 'came_from',
                      value: goto,
                    },
                };
    
                const form = {
                  action: '/login', method: 'POST', __fields: fields,
                  __submit: 'login',
                };

                return h.view('user', {
                    title: 'login', form: form,
                });
            }
        }
    },
    {
        method: 'post',
        path: '/login',
        options: {
            auth: false,
            validate: {
                payload: Joi.object({
                    //user: Joi.object().required().keys({
                        email: User.field('email').required(),
                        password: Joi.string().required(),
                        came_from: Joi.string().allow('').empty('').default('/current'),
                    //})
                })
            },
            handler: async (request, h) => {

                //const { user: { email, password } } = request.payload;
                const { email, password, came_from } = request.payload;
                const { userService, displayService } = request.services();

                const response = h.response();

                const login = async (txn) => {
                    return await userService.login({ email, password }, txn, response);
                };

                await h.context.transaction(login);

                response.redirect(came_from);
                return response;
            }
        }
    },
    {
        method: 'get',
        path: '/logout',
        options: {
            auth: false,
            handler: async (request, h) => {
                const { userService } = request.services();

                const response = h.response();
                
                request.app.authorization = null;

                const logout = async (txn) => {
                    return await userService.logout(txn, response);
                };

                await h.context.transaction(logout);

                let login = new URL(`${request.url.origin}/login`);
                if (request.query.came_from) {
                  login.searchParams.append('came_from', request.query.came_from);
                }
                response.redirect(login.href);
                
                return response;
            }
        }
    },
]);

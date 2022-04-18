'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const User = require('../../models/user');

module.exports = Helpers.withDefaults([
    {
        method: 'get',
        path: '/login',
        options: {
            auth: false,
            handler: async (request, h) => {
    
                var fields = {
                    email: {tag: 'input', type: 'email', name: 'email'},
                    password: {tag: 'input', type: 'password', name: 'password'},
                };
    
                return h.view('user', {
                    title: 'login', action: '/login', method: 'POST',
                    fields: fields
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
                        password: Joi.string().required()
                    //})
                })
            },
            handler: async (request, h) => {

                //const { user: { email, password } } = request.payload;
                const { email, password } = request.payload;
                const { userService, displayService } = request.services();

                const response = h.response();

                const login = async (txn) => {
                    return await userService.login({ email, password }, txn, response);
                };

                await h.context.transaction(login);

                response.redirect('/current');
                return response;
            }
        }
    },
    {
        method: 'get',
        path: '/logout',
        options: {
            handler: async (request, h) => {
                const { userService } = request.services();

                const response = h.response();

                const logout = async (txn) => {
                    return await userService.logout(txn, response);
                };

                await h.context.transaction(logout);

                response.redirect('/login');
                return response;
            }
        }
    },
]);

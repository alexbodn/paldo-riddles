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

                var fields = {
                    email: {tag: 'input', type: 'email', name: 'email'},
                    password: {tag: 'input', type: 'password', name: 'password'},
                    password_confirm: {tag: 'input', type: 'password', name: 'password_confirm'},
                    username: {tag: 'input', type: 'text', name: 'username'},
                    bio: {tag: 'textarea', name: 'bio'},
                    image: {tag: 'input', type: 'url', name: 'image'},
                    phone: {tag: 'input', type: 'tel', name: 'phone'},
                    sms: {tag: 'input', type: 'tel', name: 'sms'},
                    scope: {tag: 'input', type: 'text', name: 'scope'},
                };

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
                payload: Joi.object({
                    //user: Joi.object().required().keys({
                        email: User.field('email').required(),
                        password: Joi.string().required(),
                        password_confirm: Joi.valid(Joi.ref('password')),
                        username: User.field('username').required(),
                        bio: User.field('bio'),
                        image: User.field('image'),
                        phone: User.field('phone'),
                        sms: User.field('sms').required()
                    //})
                })
            },
            handler: async (request, h) => {

                //const { user: userInfo } = request.payload;
                const userInfo = request.payload;
                const { userService, displayService } = request.services();

                const signupAndFetchUser = async (txn) => {

                    const id = await userService.signup(userInfo, txn);

                    return await userService.findById(id, txn);
                };

                const user = await h.context.transaction(signupAndFetchUser);
                const { email, password } = user;

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

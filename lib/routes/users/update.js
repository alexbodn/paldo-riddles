'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const User = require('../../models/user');
const { JOI } = require('../../models/helpers');
const { val } = require('objection');

module.exports = Helpers.withDefaults({
    method: 'post',
    path: '/user',
    options: {
        validate: {
            payload: Joi.object({
                //user: Joi.object().required().keys({
                    email: User.field('email'),
                    password: Joi.string().empty('').default(''),
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
                    username: User.field('username'),
                    bio: User.field('bio'),
                    image: User.field('image'),
                    phone: User.field('phone'),
                    sms: User.field('sms'),
                    // the following editable only by admin
                    //scope: User.field('scope'),
                    scope: Joi.custom(JOI.splitArray),
                    autho_refresh: User.field('autho_refresh'),
                //})
            })
        },
        handler: async (request, h) => {
            //const { artifacts: { token } } = request.auth;
            //const { user: userInfo } = request.payload;
            const userInfo = request.payload;
            console.log('update post:', userInfo)
            const { userService, displayService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const updateUser = async (txn) => {
                return await userService.update(currentUserId, userInfo, txn);
            };

            await h.context.transaction(updateUser);

            return h.redirect('/current');

            const updateAndFetchUser = async (txn) => {

                const id = await userService.update(currentUserId, userInfo, txn);

                return await userService.findById(id, txn);
            };

            const user = await h.context.transaction(updateAndFetchUser);

            return {
                user: displayService.user(user, token)
            };
        }
    }
});

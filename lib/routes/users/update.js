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
            payload: Joi.object(Object.assign({},
                  User.joiFields,
                  User.joiPasswordUpdate,
                ))
                .options({ stripUnknown: true }),
            failAction: (request, h, error) => {
                return h.response(error.isJoi ? error.details[0] : error).takeover();
            },
        },
        handler: async (request, h) => {
            const userInfo = request.payload;
            console.log('update post:', userInfo)
            const { userService, displayService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const updateUser = async (txn) => {
                return await userService.update(currentUserId, userInfo, txn);
            };

            await h.context.transaction(updateUser);

            return h.redirect('/current');
        }
    }
});

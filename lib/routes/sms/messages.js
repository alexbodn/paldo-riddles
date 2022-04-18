'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const SMS = require('../../models/sms');

module.exports = Helpers.withDefaults([
    {
        method: 'post',
        path: '/messages',
        options: {
            //log: {collect: true},
            validate: {
                payload: SMS.joiSchema
            },
            handler: async (request, h) => {

                const msgInfo = request.payload;

                const msgsave = async (txn) => {
                    const { id } = await SMS.query(txn).insert(msgInfo);

                    return id;
                };

                const id = await h.context.transaction(msgsave);

                return id;
                return {id: id};
            }
        }
    },
    {
        method: 'get',
        path: '/messages',
        options: {
            handler: async (request, h) => {

                const { sms } = request.auth.credentials;

                const listall = async (txn) => {
                    const messages = await SMS.query(txn)
                        .where('From', sms).orWhere('To', sms);

                    return messages;
                };

                const messages = await h.context.transaction(listall);

                return messages;
            }
        }
    },
]);

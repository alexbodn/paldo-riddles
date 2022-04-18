'use strict';

// Boom builds Error objects for hapi that represent HTTP errors
const Boom = require('@hapi/boom');
const Joi = require('joi');

module.exports = {
    method: 'get',
    path: '/riddle-answer/{slug}',
    options: {
        tags: ['api'],
        validate: {
            params: Joi.object({
                slug: Joi.string().required()
            })
        },
        auth: false,
        handler: async (request) => {

            const { Riddles } = request.models();
            const { slug } = request.params;

            const riddles = await Riddles.query().select('*').where('slug', slug);

            if (!riddles.length) {
                throw Boom.notFound('Sorry, that riddle doesn\'t exist (yet)');
            }

            return riddles[0].answer;
        }
    }
};

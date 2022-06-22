'use strict';

const Helpers = require('./helpers');

module.exports = Helpers.withDefaults([
    {
        method: '*',
        path: '/{p*}',
        options: {
            auth: {
              mode: 'try',
            },
            handler: async (request, h) => {
    
                let message = `The page ${request.params.p} was not found`;
                return h.response(message).code(404);
            }
        }
    },
]);

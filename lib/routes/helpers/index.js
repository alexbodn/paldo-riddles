'use strict';

const Toys = require('@hapipal/toys');

exports.withDefaults = Toys.withRouteDefaults({
    options: {
        state: {
            parse: true,
            failAction: 'error'
        },
        auth: {
          scope: ['client'],
          mode: 'required',
        },
        response: {
          failAction: (request, h, err) => {
              request.log(['auth'], ['authentication failure', err])
              throw err;
          },
        },
        cors: true,
        validate: {
            failAction: (request, h, err) => {
              request.log(['auth'], ['authentication failure', err])
                throw err;
            }
        },
        /*log: {
            collect: true
        },*/
    }
});

exports.currentUserId = Toys.reacher('auth.credentials.id', { default: null });

'use strict';

const Bounce = require('@hapi/bounce');
const Boom = require('@hapi/boom');
const Objection = require('objection');
const { NotFoundError } = require('objection');

const transaction = (server, fn) => Objection.transaction(server.knex(), fn);

module.exports = (server, options) => ({
    scheme: 'jwt',
    options: {
        keys: {
            key: options.jwtKey,
            algorithms: ['HS256']
        },
        verify: {
            aud: false,
            iss: false,
            sub: false
        },
        httpAuthScheme: 'Token',
        validate: async ({ decoded }, request) => {

            try {
                const fetcher = async (txn) => {
                  const services = request.services();
                  //console.log('decoded to validate:', decoded)
                  const jwt = await services.jwtService.takeover(decoded.payload.id, txn);
                  //console.log('jwt:', jwt)
                  const service = services[jwt.service];
                  return await service.findById(jwt.owner, txn);
                };
                const credentials = await transaction(request.server, fetcher);
                //console.log('credentials:', credentials)
                
                return {
                    isValid: true,
                    credentials: credentials
                };
            }
            catch (error) {
                Bounce.ignore(error, NotFoundError);
                return {
                    isValid: false
                };
            }
        }
    }
});

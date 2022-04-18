'use strict';

const Bounce = require('@hapi/bounce');
const { NotFoundError } = require('objection');

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

            const { userService } = request.services();

            try {
                const credentials = await userService.findById(decoded.payload.id);
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

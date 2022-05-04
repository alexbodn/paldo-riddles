'use strict';

module.exports = [
    {
        type: 'onPostAuth',
        method: (request, h) => {
console.log('begin onPostAuth')
            try {
                if (!request.auth.credentials) {
                  request.auth.credentials = {};
                }
                let scope = request.auth.credentials.scope;
                if (scope && !Array.isArray(scope)) {
                    scope = scope.split(',');
                }
                request.auth.credentials.scope = scope || ['guest'];
            }
            catch(err) {
                console.log(err);
            }
            return h.continue;
        }
    },
];

'use strict';

module.exports = {
    method: 'get',
    path: '/',
    options: {
        auth: { strategy: 'jwt', mode: 'optional' },
        handler: {
            view: {
                template: 'home'
            }
        }
    }
};

'use strict';

module.exports = (server, options) => ({
    strategy: 'jwt',
    scope: [
      //'guest',
      'client'
    ],
});

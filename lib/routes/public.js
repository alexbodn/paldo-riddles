'use strict';

module.exports = {
    method: 'get',
    path: '/public/{p*}',
    options: {
      auth: false,
      state: {
          parse: false,
      },
      plugins: {
        yar: {
          skip: true
        },
      },
      handler: {
          directory: {
              path: 'public'
          }
      }
    }
};

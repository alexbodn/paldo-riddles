'use strict';

module.exports = {
    method: 'get',
    path: '/public/{p*}',
    options: {
      auth: false,
      state: {
          parse: false,
      },
      handler: {
          directory: {
              path: 'public'
          }
      }
    }
};

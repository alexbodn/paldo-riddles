'use strict';

// see
// https://spin.atomicobject.com/2017/03/27/timing-queries-knexjs-nodejs/

//const ChildProcess = require('child_process');
//const Util = require('util');

module.exports = [
    {
        type: 'onPreStart',
        method: async (server) => {
          let knex = server.knex();
          knex.on('query', (query) => {
            //console.log(`Executed a query: ${JSON.stringify(query)}`);
            //console.log('Executed a query:', query.sql, query.bindings);
          })
          .on('query-response', (response, query) => {
            //console.log(`Received a response from: ${JSON.stringify(query)}`);
          });
        }
    },
];

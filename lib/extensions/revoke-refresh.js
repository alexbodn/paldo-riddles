'use strict';

const Boom = require('@hapi/boom');

module.exports = [
    {
        type: 'onPreAuth',
        method: async (request, h) => {
console.log('begin onPreAuth', request.path)
//console.log('---------', request.auth.artifacts.decoded.payload)

          const services = request.services();
          const auth = request.server.auth;
          const config = auth.lookup(request.route);
          if (config === false) {
            return h.continue;
          }
          try {
            let jwt = services.jwtService.parseToken(
              request.headers.authorization);
            jwt = await services.jwtService.findById(jwt.id);
            console.log('token retrieved:', jwt)
            let now = services.jwtService.tsSecs();
            //jwt.rvk = now - 2000;
            if (jwt.rvk && now >= jwt.rvk) {
              let rvk = new Date(jwt.rvk * 1000);
              
              const attempt = async (txn) => {
                const { JWT } = request.server.models();
                return await JWT.query(txn)
                  .increment('attempts_after_rvk', 1)
                  .where({id: jwt.id});
              };
              
              await h.context.transaction(attempt);

              request.headers.authorization = null;
              throw Boom.forbidden(`this token was revoked at ${rvk}`);
            }
            //jwt.autho_refresh = now - 60*60*24;
            if (jwt.autho_refresh && now >= jwt.autho_refresh) {
              try {
                const refresh = async (txn) => {
                  const service = services[jwt.service];
                  let token = await service.createToken(jwt.owner, jwt.id, txn);
                  console.log('new token:', token)
                  request.headers.authorization = services.jwtService.setPrefix(token);
                  console.log(`refreshed token ${JSON.stringify(jwt)} by '${token}'`)
                };
                
                await h.context.transaction(refresh);
              }
              catch(err) {
                const whom = `${jwt.service}/${jwt.owner}`;
                console.log(`error ${err} refreshing token for ${whom}`);
                request.headers.authorization = null;
                if (config.mode == 'required') {
                    return h.redirect('/login').takeover();
                }
              }
            }
          }
          finally {
            return h.continue;
          }
        }
    },
];

'use strict';

const logTags = ['revoke-refresh'];

const Boom = require('@hapi/boom');

module.exports = [
    {
        type: 'onPreAuth',
        method: async (request, h) => {
          const auth_config = request.server.auth.lookup(request.route);
          if (auth_config === false) {
            return h.continue;
          }
          request.log(logTags, ['begin onPreAuth'])

          const services = request.server.services();
          let now = services.jwtService.tsSecs();
          try {
            let jwt = services.jwtService.parseToken(
              request.headers.authorization);
            jwt = await services.jwtService.findById(jwt.id);
            request.log(logTags, ['token retrieved:', jwt])
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
            else {
              request.log(logTags, ['token not revoked:', jwt])
            }
            //jwt.autho_refresh = now - 60*60*24;
            if (jwt.autho_refresh && now >= jwt.autho_refresh) {
              try {
                const refresh = async (txn) => {
                  const service = services[jwt.service];
                  let token = await service.createToken(jwt.owner, jwt.id, txn);
                  request.log(logTags, ['new token:', token])
                  request.headers.authorization = services.jwtService.setPrefix(token);
                  request.log(logTags, [`refreshed token ${JSON.stringify(jwt)} by '${token}'`])
                };
                
                await h.context.transaction(refresh);
              }
              catch(err) {
                const whom = `${jwt.service}/${jwt.owner}`;
                request.log(['error'].concat(logTags), [`error ${err} refreshing token for ${whom}`]);
                request.headers.authorization = null;
              }
            }
            else {
              request.log(logTags, ['refresh not needed for token:', jwt])
            }
            if (now > jwt.exp) {
              request.headers.authorization = null;
              request.log(logTags, ['token expired:', jwt])
            }
//            if (!request.headers.authorization && auth_config.mode == 'required') {
//              request.log(logTags, ['login required'])
//              return h.redirect('/login').takeover();
//            }
          }
          finally {
            request.log(logTags, ['end onPreAuth'])
            return h.continue;
          }
        }
    },
    /*{
        type: 'onCredentials',
        method: async (request, h) => {
          const auth_config = request.server.auth.lookup(request.route);
          if (auth_config === false) {
            return h.continue;
          }
          request.log(logTags, ['begin onCredentials', request.path])
          return h.continue;
        }
    }*/
];

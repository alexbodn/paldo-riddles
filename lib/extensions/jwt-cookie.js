'use strict';

module.exports = [
    {
        type: 'onPreAuth',
        method: (request, h) => {
console.log('begin onPreAuth', request.path)
            try {
                console.log('req auth header initially:', request.headers.authorization)
                const { jwtService } = request.services();
      
                if (request.headers.authorization) {
                    return h.continue;
                }
                try {
                    let token = request.state ? request.state.token : null;
                    console.log('token cookie:', token)
                    if (Array.isArray(token)) {
                      token = token[token.length-1];
                    }
                    console.log('token from cookie:', token)
                    if (token) {
                      request.headers.authorization = jwtService.setPrefix(token);
                    }
                }
                catch(err) {
                    console.log(err);
                }
                console.log('req auth header is:', request.headers.authorization)
                
                const auth = request.server.auth;
                const config = auth.lookup(request.route);
                if (!request.headers.authorization && config.mode == 'required') {
                    return h.redirect('/login').takeover();
                }
            }
            catch(err) {
                console.log(err);
            }
            return h.continue;
        }
    },
    {
        type: 'onPreHandler',
        method: async (request, h) => {
console.log('begin onPreHandler', request.path)
            
            const { jwtService } = request.services();
  
            if (request.headers.authorization) {
              request.app.authorization = request.headers.authorization;
            }
            console.log('resp header currently is:', request.app.authorization)
            return h.continue;
        }
    },
    {
        type: 'onPreResponse',
        method: async (request, h) => {
console.log('begin onPreResponse', request.path)
            
            const { jwtService } = request.services();
  
            let resp_auth = request.app.authorization;
            console.log('resp header to cookie is:', resp_auth)
            if (resp_auth) {
              let token = jwtService.stripPrefix(resp_auth);
              console.log('cookie to save:', token)
              h.response().unstate("token", request.server.states.settings)
              h.response().state("token", token, request.server.states.settings);
              h.response().header('authorization', jwtService.setPrefix(resp_auth));
            }
            return h.continue;
        }
    },
];

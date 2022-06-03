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
            }
            catch(err) {
                console.log(err);
            }
            
            const auth = request.server.auth;
            const config = auth.lookup(request.route);
            if (!request.headers.authorization && config.mode == 'required') {
                let login_url = new URL(`${request.url.origin}/login`);
                login_url.searchParams.append('came_from', request.url.href);
                return h.redirect(login_url.href).takeover();
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
              //console.log('++++++ cookie to save:', token, request.path)
              h.response().unstate("token")
              h.response().state("token", token, {path: '/'});
              h.response().header('authorization', jwtService.setPrefix(resp_auth));
            }
            return h.continue;
        }
    },
];

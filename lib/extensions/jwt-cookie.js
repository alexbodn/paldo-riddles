'use strict';

const logTags = ['jwt-cookie'];

module.exports = [
    {
        type: 'onPreAuth',
        method: (request, h) => {
            if (request.server.auth.lookup(request.route) === false) {
              return h.continue;
            }
            if (request.headers.authorization) {
                return h.continue;
            }
            request.log(logTags, ['begin onPreAuth'])
            try {
                request.log(logTags, ['req auth header initially:', request.headers.authorization])
                const { jwtService } = request.server.services();
      
                try {
                    let token = request.state ? request.state.token : null;
                    request.log(logTags, ['token cookie:', token])
                    if (Array.isArray(token)) {
                      token = token[token.length-1];
                    }
                    request.log(logTags, ['token from cookie:', token])
                    if (token) {
                      request.headers.authorization = jwtService.setPrefix(token);
                    }
                }
                catch(err) {
                    request.log(['error'].concat(logTags), [err]);
                }
                request.log(logTags, ['req auth header is:', request.headers.authorization])
            }
            catch(err) {
                request.log(['error'].concat(logTags), [err]);
            }
            finally {
                request.log(logTags, ['end onPreAuth'])
                return h.continue;
            }
        }
    },
    /*{
        type: 'onPostAuth',
        method: async (request, h) => {
            
            request.log(logTags, ['begin onPostAuth'])
            const auth_config = request.server.auth.lookup(request.route);
            if (!request.headers.authorization && auth_config.mode == 'required') {
                let login_url = new URL(`${request.url.origin}/login`);
                login_url.searchParams.append('came_from', request.url.href);
                return h.redirect(login_url.href).takeover();
            }
            
            return h.continue;
        }
    },*/
    {
        type: 'onPreHandler',
        method: async (request, h) => {
            if (request.server.auth.lookup(request.route) === false) {
              return h.continue;
            }
            request.log(logTags, ['begin onPreHandler'])
            
            const { jwtService } = request.server.services();
  
            if (request.headers.authorization) {
              request.app.authorization = request.headers.authorization;
            }
            request.log(logTags, ['resp header currently is:', request.app.authorization])
            return h.continue;
        }
    },
    {
        type: 'onPreResponse',
        method: async (request, h) => {
            if (request.server.auth.lookup(request.route) === false) {
              return h.continue;
            }
            request.log(logTags, ['begin onPreResponse'])
            
            const { jwtService } = request.server.services();
  
            let resp_auth = request.app.authorization;
            if (resp_auth) {
              let token = jwtService.stripPrefix(resp_auth);
              //request.log(logTags, ['++++++ cookie to save:', token, request.path])
              request.log(logTags, ['resp header to cookie is:', resp_auth])
              h.response().unstate("token")
              h.response().state("token", token);
              h.response().header('authorization', jwtService.setPrefix(resp_auth));
            }
            request.log(logTags, ['end onPreResponse'])
            return h.continue;
        }
    },
];

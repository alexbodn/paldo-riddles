'use strict';

module.exports = [
    {
        type: 'onPreAuth',
        method: (request, h) => {
            if (request.headers.authorization) {
                h.continue;
            }
            try {
                const server = request.server;
                const auth = server.auth;
                const config = auth.lookup(request.route);
                var state_token = null;
                try {
                    state_token = request.state.token;
                }
                catch(err) {
                    state_token = null;
                }
                if (state_token) {
                    request.headers.authorization = 'Token '+state_token;
                }
                if (!request.headers.authorization && config.mode == 'required') {
                    return h.redirect('/login').takeover();
                }

                // Try each strategy
        
                //console.log('=====+++++', config, config.mode, request.state);
                if (0) {
                for (const name of config.strategies) {
                    //console.log('=====', config.strategies);
                    continue;
                    const strategy = auth.strategies[name];
                    const httpAuthScheme = strategy.httpAuthScheme;
                    if (httpAuthScheme) {
                        const data = httpAuthScheme+' '+request.state.token;
                        request.headers.authorization = data;
                    }
                }
                }
            }
            catch(err) {
                console.log(err);
            }
            return h.continue;
        }
    },
];

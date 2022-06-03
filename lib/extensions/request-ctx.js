'use strict';

module.exports = [
    {
        type: 'onPreResponse',
        method: (request, h) => {
            const { User } = request.models();

            try {
                const response = request.response;
                if (response.variety == 'view') {
                  // make sure the view context is initialized:
                  response.source.context = response.source.context || {};
                  try {
                    response.source.context.userId = request.auth.credentials.id;
                    const scopes = request.auth.credentials.scope;
                    response.source.context.menu_options =
                      User.scopes_actions(scopes, request);
                  }
                  catch(err) {
                    console.log(err)
                    response.source.context.userId = null;
                    response.source.context.menu_options = [];
                  }
                  let session = request.state.session;
                  if (session && session.flashMessage) {
                    response.source.context.flashMessage = session.flashMessage;
                    delete session.flashMessage;
                    response.state('session', session);
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

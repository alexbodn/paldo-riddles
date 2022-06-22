'use strict';

module.exports = [
    {
        type: 'onPostHandler',
        options: {
          before: ['@hapi/yar', ]
        },
        method: async (request, h) => {
            const { User } = request.models();

            try {
                const response = request.response;
                if (response.variety == 'view') {
                  // make sure the view context is initialized:
                  response.source.context = response.source.context || {};
                  try {
                    response.source.context.userId = request.auth.credentials.id;
                    const scopes = request.auth.credentials.scope;
                    const menu_options =
                      [{tag: 'header', text: 'menu options'}].concat(
                        User.scopes_actions(scopes, request));
                    response.source.context.menu_options = [
                      menu_options, menu_options, menu_options,
                      menu_options, menu_options, menu_options,
//                      menu_options, menu_options, menu_options,
//                      menu_options, menu_options, menu_options,
                    ];
                  }
                  catch(err) {
                    console.log(err)
                    response.source.context.userId = null;
                    response.source.context.menu_options = [];
                  }
                  let flashMessage = request.yar.flash();
                  //await request.yar.commit(h); // as this happens after the yar hook
                  response.source.context.flashMessage =
                    'let flashMessage = ' + JSON.stringify(flashMessage || {}) + ';';
                }
            }
            catch(err) {
                console.log(err);
            }
            return h.continue;
        }
    },
];

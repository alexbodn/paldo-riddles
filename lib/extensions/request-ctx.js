'use strict';

module.exports = [
    {
        type: 'onPreResponse',
        method: (request, h) => {
            const { userService } = request.services();

            try {
                const response = request.response;
                if (response.variety == 'view') {
                  // make sure the view context is initialized:
                  response.source.context = response.source.context || {};
                  try {
                    response.source.context.userId = request.auth.credentials.id;
                    const scopes_info = userService.scopes_info();
                    const scopes = request.auth.credentials.scope;
                    response.source.context.menu_options = scopes.map(scope => {
                        return scopes_info[scope].menu_options;
                      }).reduce((left, right) => {
                        return left.concat(right);
                      }, [])
                      .filter(element => {return element.href != request.path;});
                    }
                  catch(err) {
                    console.log(err)
                    response.source.context.userId = null;
                    response.source.context.menu_options = [];
                  }
                    //console.log(request.path);
                }
            }
            catch(err) {
                console.log(err);
            }
            return h.continue;
        }
    },
];

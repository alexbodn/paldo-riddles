'use strict';

const Helpers = require('../helpers');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/current',
    options: {
        handler: async (request, h) => {

            const { userService, displayService } = request.services();
            const scopes_info = userService.scopes_info();
            
            var fields = {
                email: {tag: 'input', type: 'email'},
                password: {tag: 'input', type: 'password'},
                password_confirm: {tag: 'input', type: 'password'},
                password_current: {tag: 'input', type: 'password'},
                username: {tag: 'input', type: 'text'},
                bio: {tag: 'textarea'},
                image: {tag: 'input', type: 'url'},
                phone: {tag: 'input', type: 'tel'},
                sms: {tag: 'input', type: 'tel'},
                scope: {tag: 'input', type: 'radio', options: Object.keys(scopes_info), multiple: true},
                autho_refresh: {tag: 'input', type: 'number'},
                //scope: {tag: 'input', type: 'text', readonly: true},
                //scope: {tag: 'select', options: Object.keys(scopes_info), multiple: true},
            };
            
            console.log('current user credentials:', request.auth.credentials)

            const currentUserId = Helpers.currentUserId(request);

            const fetchUser = async (txn) => {

                return await userService.findById(currentUserId, txn);
            };

            // maybe the transaction is not needed
            const user = await h.context.transaction(fetchUser);

            const private_fields = ['password', 'id'];
            for (var [key, val] of Object.entries(user)) {
                if (private_fields.includes(key)) {
                  continue;
                }
                fields[key].__val = val;
            }
            for (var [key, val] of Object.entries(fields)) {
                val.__label = {__label: key + ': ', __class: 'field_label'};
                val.name = key;
            }

            return h.view('user', {
                title: 'update', action: '/user', method: 'POST',
                fields: fields,
            });
        }
    }
});

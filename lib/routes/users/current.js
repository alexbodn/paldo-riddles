'use strict';

const Helpers = require('../helpers');
const User = require('../../models/user');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/current',
    options: {
        handler: async (request, h) => {

            const { userService, displayService } = request.services();

            var fields = User.fieldsEdit();
            
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
            
            const form = {
              action: '/user', method: 'POST', __fields: fields,
            };
            
            return h.view('user', {
                title: 'update', form: form,
            });
        }
    }
});

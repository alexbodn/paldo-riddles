'use strict';

const logTags = ['need-login'];

module.exports = [
    {
//        type: 'onPostAuth',
        type: 'onPreResponse',
        method: async (request, h) => {
            if (request.response.isBoom) {
              request.log(logTags, ['begin onPreResponse'])
              const output = request.response.output.payload;
              if (output.statusCode == 401) {
                let message = `${output.error} - ${output.message}`;
                request.yar.flash('warning', message);
                await request.yar.commit(h)
                let login_url = new URL(`${request.url.origin}/login`);
                login_url.searchParams.append('came_from', request.url.href);
                return h.response().takeover().redirect(login_url.href);
              }
            }
            return h.continue;
        }
    }
];
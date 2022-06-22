'use strict';

module.exports = [
    {
        type: 'onPreStart',
        method: async (server) => {
            server.events.on('log', (event, tags) => {
            
                if (tags.error) {
                    console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
                }
                else {
                    console.log(event.tags, ...event.data);
                }
            });
            
            server.events.on('request', (request, event, tags) => {
            
                if (tags.error) {
                    console.log(`Error in request: ${event.error ? event.error.message : 'unknown'}`);
                }
                else
                if (true
                  //typeof event.data == undefined || event.tags[0].startsWith('flash-')
                  )
                {
                    console.log(event.tags, request.path, event.data);
                }
            });
            
            server.events.on('response', (request) => {
                
                //return;
                console.log(`Response sent for request: ${request.info.id} ${request.response.statusCode} ${request.path}, collected logs:`, request.logs.map((event => [event.tags, event.data])));
            });
        }
    },
];
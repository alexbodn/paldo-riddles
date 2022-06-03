'use strict';

const dataSend = (scheme, options, body, headers) => {
    return new Promise((resolve,reject) => {
        const req = scheme.request(options, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        })
        req.on('error',reject);
        if(body) {
            req.write(body);
        }
        req.end();
    })
};

const jsonSend = async (scheme, options, json, headers) => {
    const buildOptions = (options, headers, json) => {
      const needed_headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json)
      };
    
      const req_options = {
        ...options,
        headers: {
          ...needed_headers,
          ...headers,
        },
      };
      
      return req_options;
    }
    
    const body = JSON.stringify(json);
    options = buildOptions(options, headers, body);

    return dataSend(scheme, options, body, headers);
};

module.exports = { dataSend, jsonSend };


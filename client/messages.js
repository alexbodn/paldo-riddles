'use strict'

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

function webget(scheme, options, data, headers, onsuccess, onerror) {

  const json = JSON.stringify(data);
  const opts = buildOptions(options, headers, json);

  const req = scheme.request(opts, response => {
    response.setEncoding('utf8');
    const chunks = [];

    response.on('data', chunk => {
      chunks.push(chunk);
    });

    response.on('end', function () {
      if (response.statusCode === 200) {
        if (onsuccess) {
          onsuccess(chunks.join(''));
        }
      } else {
        if (onerror) {
          onerror(response.statusCode);
        }
      }
    });
  });
      
  req.on('error', error => {
    onerror(error);
  });
      
  req.write(json);
  req.end();
}


function dataSend(scheme, options, data, headers) {
  
    return new Promise((resolve,reject) => {
        const body = JSON.stringify(data);
        const opts = buildOptions(options, headers, body);

        const req = scheme.request(opts, res => {
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
}


const data = {
    TimeSent:"20220318T202201UTC",
    TimeReceived:"20220318T202201UTC",
    SmsSid:"SM53263d7713cfd391b84fbc738dbebb46",
    SmsStatus:"received",
    NumSegments:"1",
    From:"+972515010718",
    AccountSid:"AC53d39b824a6964d2db70a2c71ded1a65",
    To:"+14094055673",
    Body:"שוב",
    NumMedia:"0"
};

var TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ5NDk4NzQwLCJleHAiOjE2NTAxMDM1NDB9.MZjAsKdXMGMqmJRW07aGmVxVfU3A8pIS75RKg58yG1k";

const headers = {
    Authorization: `Token ${TOKEN}`
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/messages',
  method: 'POST',
}

function onsuccess(data) {
    console.log(`success ${data}`);
}

function onerror(error) {
    console.error(error)
}

const scheme = require('http');

//webget(scheme, options, data, headers, onsuccess, onerror);

dataSend(scheme, options, data, headers)
  .then(res => {
    console.log(`Success ${res}`);
  })
  .catch(err => {
    console.log(`Error ${err}`)
});

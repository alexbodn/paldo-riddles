'use strict';

const {jsonSend} = require('websend');

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

const scheme = require('http');

jsonSend(scheme, options, data, headers)
  .then(res => {
    console.log(`Success ${res}`);
  })
  .catch(err => {
    console.log(`Error ${err}`)
});

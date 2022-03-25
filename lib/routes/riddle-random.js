'use strict';

const Data = require('../data');

module.exports = {
    method: 'get',
    path: '/riddle-random',
    options: {
        // Our handler doesn't need to do anything asynchronous or use the
        // response toolkit, so the route handler's signature appears a little simpler than before
        handler: (request) => {

            const randomIndex = Math.floor(Math.random() * Data.riddles.length);
            const randomRiddle = Data.riddles[randomIndex];

            return `${randomRiddle.slug} — ${randomRiddle.question}`;
        }
    }
};

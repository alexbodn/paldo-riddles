'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');
const Schwifty = require('@hapipal/schwifty');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: 'localhost',
        port: {
            $param: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: 'NODE_ENV',
            $default: {
                log: ['error', 'start'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                options: {
                    developmentMode: {
                        $filter: { $env: 'NODE_ENV' },
                        $default: true,
                        production: false
                    },
                    jwtKey: {
                        $filter: 'NODE_ENV',
                        $default: {
                            $param: 'APP_SECRET',
                            $default: 'app-secret'
                        },
                        production: {           // In production do not default to "app-secret"
                            $param: 'APP_SECRET'
                        }
                    },
                    cookie_options : {
                        ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today
                        encoding: 'none',    // we already used JWT to encode
                        isSecure: true,      // warm & fuzzy feelings
                        isHttpOnly: true,    // prevent client alteration
                        clearInvalid: false, // remove invalid cookies
                        strictHeader: true,  // don't allow violations of RFC 6265
                        path: '/'            // set the cookie for all routes
                    },
                }
            },
            {
                plugin: '@hapipal/schwifty',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        migrateOnStart: true,
                        knex: {
                            client: 'sqlite3',
                            useNullAsDefault: true,     // Suggested for sqlite3
                            connection: {
                                //filename: ':memory:'
                                filename: `${process.env.DATABASE}.sqlite`,
                            },
                            migrations: {
                                stub: Schwifty.migrationsStubPath
                            }
                        }
                    },
                    production: {
                        migrateOnStart: false
                    }
                }
            },
            {
                plugin: './plugins/swagger'
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});

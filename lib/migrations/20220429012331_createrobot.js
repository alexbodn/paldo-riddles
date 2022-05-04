'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Robots', (t) => {

        t.increments('id').primary();
        t.string('url').notNullable().unique();
        t.string('username').notNullable().defaultTo('').unique();
        t.binary('password');
        t.text('info');
        t.string('scope');
        t.biginteger('autho_refresh').nullable();
    });
};

exports.down = async (knex) => {

    await knex.schema.dropTable('Robots');
};

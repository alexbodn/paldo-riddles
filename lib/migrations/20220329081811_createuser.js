'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('Users', (t) => {

        t.increments('id').primary();
        t.string('email').notNullable().unique();
        t.binary('password');
        t.string('username').notNullable().defaultTo('').unique();
        t.text('bio');
        t.string('image');
    });
};

exports.down = async (knex) => {

    await knex.schema.dropTable('Users');
};

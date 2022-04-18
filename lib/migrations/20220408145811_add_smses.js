'use strict';

exports.up = async (knex) => {

    await knex.schema.createTable('SMSes', (table) => {

        table.increments('id').primary();

        table.datetime('TimeSent').notNullable();
        table.datetime('TimeReceived').notNullable();
        table.string('SmsSid').notNullable(); //should probably be unique
        table.string('SmsStatus').notNullable();
        table.string('NumSegments').notNullable();
        table.string('From').notNullable();
        table.string('AccountSid').notNullable();
        table.string('To').notNullable();
        table.text('Body').notNullable();
        table.string('NumMedia').notNullable();
        table.tinyint('Pinned').defaultTo(0).notNullable();
        table.tinyint('Starred').defaultTo(0).notNullable();
        table.tinyint('Trashed').defaultTo(0).notNullable();
    });
    
};

exports.down = async (knex) => {

    await knex.schema.dropTable('SMSes');
    
};

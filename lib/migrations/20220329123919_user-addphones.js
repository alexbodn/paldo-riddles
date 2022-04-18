'use strict';

exports.up = async (knex) => {

    await knex.schema
        .table('Users', (t) => {

            t.string('phone');
            t.string('sms');
        })
};

exports.down = async (knex) => {

    await knex.schema
        .table('Users', (t) => {

            t.dropColumn('sms');
            t.dropColumn('phone');
        });
};

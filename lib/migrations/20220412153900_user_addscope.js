'use strict';

exports.up = async (knex) => {

    await knex.schema
        .table('Users', (t) => {

            t.string('scope');
        });
};

exports.down = async (knex) => {

    await knex.schema
        .table('Users', (t) => {

            t.dropColumn('scope');
        });
};

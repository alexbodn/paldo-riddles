'use strict';

exports.up = async (knex) => {

    await knex.schema
        .createTable('Followers', (t) => {

            t.integer('followerId').unsigned().notNullable()
                .references('Users.id')
                .onDelete('cascade');
            t.integer('userId').unsigned().notNullable()
                .references('Users.id')
                .onDelete('cascade');
            t.primary(['followerId', 'userId']);
        });
};

exports.down = async (knex) => {

    await knex.schema
        .dropTable('Followers')
};

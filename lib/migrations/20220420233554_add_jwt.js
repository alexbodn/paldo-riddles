'use strict';

exports.up = async (knex) => {
  
    await knex.schema.createTable('JWTs', (table) => {

        table.increments('id').primary();

        table.string('service').notNullable();
        table.integer('owner').notNullable();
        table.biginteger('iat').notNullable();
        table.biginteger('exp').nullable();
        table.biginteger('rvk').nullable();
        table.integer('keep_after_exp').nullable();
        table.integer('trials_after_rvk').nullable().defaultTo(0);
        table.text('comment').nullable();
    });

};

exports.down = async (knex) => {
    
    await knex.schema.dropTable('JWTs');
    
};

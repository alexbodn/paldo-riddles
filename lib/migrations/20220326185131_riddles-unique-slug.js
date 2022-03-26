'use strict';

exports.up = async (knex) => {
    await knex.schema.alterTable('Riddles', function(table) {
        table.unique('slug', 'riddles_unique_slug');
    });
};

exports.down = async (knex) => {
    await knex.schema.alterTable('Riddles', function(table) {
        table.dropIndex(['slug'], 'riddles_unique_slug');
    });    
};

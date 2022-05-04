'use strict';

exports.up = async (knex) => {
    
  await knex.schema.table('JWTs', (table) => {
    table.string('replaces').nullable();
  });
};

exports.down = async (knex) => {
    
  await knex.schema.table('JWTs', (table) => {
    table.dropColumn('replaces');
  });
};

'use strict';

exports.up = async (knex) => {
    
  await knex.schema.table('Robots', (table) => {
    table.string('contentType').nullable();
    table.string('headers').nullable();
  });
};

exports.down = async (knex) => {
    
  await knex.schema.table('Robots', (table) => {
    table.dropColumn('headers');
    table.dropColumn('contentType');
  });
};

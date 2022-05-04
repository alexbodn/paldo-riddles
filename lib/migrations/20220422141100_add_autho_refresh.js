'use strict';

exports.up = async (knex) => {
  await knex.schema.table('JWTs', (table) => {
    table.biginteger('autho_refresh').nullable();
  });
  await knex.schema.table('Users', (table) => {
    table.biginteger('autho_refresh').nullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.table('JWTs', (table) => {
    table.dropColumn('autho_refresh');
  });
  await knex.schema.table('Users', (table) => {
    table.dropColumn('autho_refresh');
  });
};

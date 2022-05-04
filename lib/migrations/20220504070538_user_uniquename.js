'use strict';

exports.up = async (knex) => {
  await knex.schema.alterTable('Users', (table) => {
    table.unique('username', 'users_unique_name');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('Users', (table) => {
    table.dropIndex(['username'], 'users_unique_name');
  });
};

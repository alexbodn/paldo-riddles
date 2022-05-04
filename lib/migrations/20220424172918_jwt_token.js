'use strict';

exports.up = async (knex) => {
  return;
  knex.on('query', (query) => {
    console.log(`Executed a query: ${JSON.stringify(query)}`);
  })
  .on('query-response', (response, query) => {
    console.log(`Received a response from: ${JSON.stringify(query)}`);
  });
  await knex.schema.table('JWTs', (table) => {
    table.string('token').nullable();
  });
  await knex.schema.alterTable('JWTs', (table) => {
    table.unique('token', 'jwt_unique_token');
  });
};

exports.down = async (knex) => {
  return;
  knex.on('query', (query) => {
    console.log(`Executed a query: ${JSON.stringify(query)}`);
  })
  .on('query-response', (response, query) => {
    console.log(`Received a response from: ${JSON.stringify(query)}`);
  });
  await knex.schema.alterTable('JWTs', (table) => {
    table.dropIndex(['token'], 'jwt_unique_token');
  });
  await knex.schema.table('JWTs', (table) => {
    table.dropColumn('token');
  });
};

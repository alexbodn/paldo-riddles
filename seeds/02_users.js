
exports.seed = function(knex) {
  return knex('users').update({scope: 'client'});
};

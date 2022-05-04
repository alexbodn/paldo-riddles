'use strict';

exports.up = async (knex) => {
    return knex.schema.table ('JWTs', (table) => {
        table.renameColumn('trials_after_rvk', 'attempts_after_rvk');
    });
};

exports.down = async (knex) => {
    return knex.schema.table ('JWTs', (table) => {
        table.renameColumn('attempts_after_rvk', 'trials_after_rvk');
    });
};

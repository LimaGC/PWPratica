exports.up = (knex) => knex.schema.createTable('names', (t) => {
  t.increments('id').primary();
  t.string('name', 100).notNull();
  t.datetime('created_at').notNullable();
  t.datetime('updated_at');
});

exports.down = (knex) => knex.schema.dropTable('names');

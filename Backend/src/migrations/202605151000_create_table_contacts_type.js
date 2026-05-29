exports.up = (knex) => knex.schema.createTable('contacts_type', (t) => {
  t.increments('id').primary();

  t.string('type_name', 100).notNullable();

  t.datetime('created_at').notNullable();
  t.datetime('updated_at');
});

exports.down = (knex) => knex.schema.dropTable('contacts_type');
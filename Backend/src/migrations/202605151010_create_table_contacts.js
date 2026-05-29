exports.up = (knex) => knex.schema.createTable('contacts', (t) => {
  t.increments('id').primary();

  t.integer('user_id')
    .unsigned()
    .notNullable()
    .references('id')
    .inTable('names');

  t.integer('contact_id')
    .unsigned()
    .notNullable()
    .references('id')
    .inTable('contacts_type');

  t.string('contact_desc', 100).notNullable();

  t.datetime('created_at').notNullable();
  t.datetime('updated_at');
});

exports.down = (knex) => knex.schema.dropTable('contacts');
exports.up = (knex) => knex.schema.createTable('skills', (t) => {
  t.increments('id').primary();

  t.string('skill_desc', 100).notNullable();
  t.integer('user_id')
    .unsigned()
    .notNullable()
    .references('id')
    .inTable('names');

  t.datetime('created_at').notNullable();
  t.datetime('updated_at');
});

exports.down = (knex) => knex.schema.dropTable('skills');
exports.up = (knex) => knex.schema.createTable('utilizadores', (t) => {
  t.increments('id').primary();

  t.string('nome', 100).notNullable();
  t.string('email', 100).notNullable().unique();
  t.text('password').notNullable();

  t.datetime('criado_em').notNullable().defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('utilizadores');

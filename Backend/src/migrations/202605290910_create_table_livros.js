exports.up = (knex) => knex.schema.createTable('livros', (t) => {
  t.increments('id').primary();

  t.string('titulo', 200).notNullable();
  t.string('autor', 200).notNullable();
  t.string('isbn', 50).notNullable().unique();
  t.string('estado', 20).notNullable().defaultTo('disponivel');

  t.timestamp('criado_em').defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('livros');

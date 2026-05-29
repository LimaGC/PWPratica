exports.up = (knex) => knex.schema.createTable('reservas', (t) => {
  t.increments('id').primary();

  t.integer('utilizador_id')
    .unsigned()
    .notNullable()
    .references('id')
    .inTable('utilizadores');

  t.integer('livro_id')
    .unsigned()
    .notNullable()
    .references('id')
    .inTable('livros');

  t.timestamp('data_reserva').defaultTo(knex.fn.now());
  t.string('estado', 20).notNullable().defaultTo('ativa');
});

exports.down = (knex) => knex.schema.dropTable('reservas');

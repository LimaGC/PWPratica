exports.up = (knex) => knex.schema.alterTable('names', (t) => {
  t.string('email', 100).unique();
  t.text('pass')
});

exports.down = (knex) => knex.schema.alterTable('names', (t) => {
  t.dropColumn('email');
  t.dropColumn('pass');
});
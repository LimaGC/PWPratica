const bcryptUp = require('bcrypt');



exports.seed = async (knex) => {

  const demoPass = await bcryptUp.hash('password123', 10);

  const data = [
    {
      nome: 'Utilizador Demo',
      email: 'utilizador@biblioteca.pt',
      password: demoPass,
    },
    {
      nome: 'Admin Biblioteca',
      email: 'admin@biblioteca.pt',
      password: demoPass,
    },
  ];

  return Promise.all(data.map(async (d) => {
    const rows = await knex('utilizadores').select().where('email', d.email);
    if (rows.length === 0) {
      await knex('utilizadores').insert(d);
    }
    return true;
  }));
};

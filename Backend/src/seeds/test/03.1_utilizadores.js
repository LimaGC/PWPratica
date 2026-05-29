const moment = require('moment');
const bcryptUp = require('bcrypt');
const setDate = moment().format('YYYY-MM-DD HH:mm:ss');



exports.seed = async (knex) => {

  const demoPass = await bcryptUp.hash('123456', 10);

  const data = [
    {
      nome: 'Pedro Sousa',
      email: 'psousa@biblioteca.pt',
      password: demoPass,
      criado_em: setDate,
    },
    {
      nome: 'Ana Costa',
      email: 'ana@biblioteca.pt',
      password: demoPass,
      criado_em: setDate,
    },
    {
      nome: 'Margarida',
      email: 'margarida@biblioteca.pt',
      password: demoPass,
      criado_em: setDate,
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

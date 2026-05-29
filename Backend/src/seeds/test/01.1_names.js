const moment = require('moment');
const bcryptUp = require('bcrypt');
const setDate = moment().format('YYYY-MM-DD hh:mm:ss');



exports.seed = async (knex) => {

  const demoPass = await bcryptUp.hash('123456', 10);
  
  const data = [
    {
      name: 'Pedro Emanuel Cardoso de Sousa',
      email: 'psousa@gmail.com',
      pass: demoPass,
      created_at: setDate,
    },
    {
      name: 'Ana Isabel Araújo Mesquita da Costa',
      email: 'ana@gmail.com',
      pass: demoPass,
      created_at: setDate,
    },
    {
      name: 'Margarida',
      email: 'margarida@gmail.com',
      pass: demoPass,
      created_at: setDate,
    },
    {
      name: 'Francisco',
      email: 'francisco@gmail.com',
      pass: demoPass,
      created_at: setDate,
    },
  ];

  return Promise.all(data.map(async (d) => {
    const rows = await knex('names').select().where('name', d.name);
    if (rows.length === 0) {
      await knex('names').insert(d);
    }
    return true;
  }));
};

const moment = require('moment');
const setDate = moment().format('YYYY-MM-DD HH:mm:ss');



exports.seed = async (knex) => {


  const data = [
    {
      titulo: 'Os Lusíadas',
      autor: 'Luís de Camões',
      isbn: '978-972-0-01000-0',
      estado: 'disponivel',
      criado_em: setDate,
    },
    {
      titulo: 'Mensagem',
      autor: 'Fernando Pessoa',
      isbn: '978-972-0-02000-1',
      estado: 'disponivel',
      criado_em: setDate,
    },
    {
      titulo: 'Memorial do Convento',
      autor: 'José Saramago',
      isbn: '978-972-0-03000-2',
      estado: 'disponivel',
      criado_em: setDate,
    },
  ];

  return Promise.all(data.map(async (d) => {
    const rows = await knex('livros').select().where('isbn', d.isbn);
    if (rows.length === 0) {
      await knex('livros').insert(d);
    }
    return true;
  }));
};

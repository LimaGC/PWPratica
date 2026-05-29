exports.seed = async (knex) => {

  const data = [
    {
      titulo: 'Os Lusíadas',
      autor: 'Luís de Camões',
      isbn: '978-972-0-01000-0',
      estado: 'disponivel',
    },
    {
      titulo: 'Memorial do Convento',
      autor: 'José Saramago',
      isbn: '978-972-0-01001-7',
      estado: 'disponivel',
    },
    {
      titulo: 'O Crime do Padre Amaro',
      autor: 'Eça de Queirós',
      isbn: '978-972-0-01002-4',
      estado: 'disponivel',
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

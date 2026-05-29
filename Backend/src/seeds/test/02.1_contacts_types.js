const moment = require('moment');
const setDate = moment().format('YYYY-MM-DD HH:mm:ss');



exports.seed = async (knex) => {

  
  const data = [
    {
      type_name: 'Email',
      created_at: setDate,
    },
    {
      type_name: 'Mobile',
      created_at: setDate,
    },
    {
      type_name: 'Page',
      created_at: setDate,
    },
  ];

  return Promise.all(data.map(async (d) => {
    const rows = await knex('contacts_type').select().where('type_name', d.type_name);
    if (rows.length === 0) {
      await knex('contacts_type').insert(d);
    }
    return true;
  }));
};

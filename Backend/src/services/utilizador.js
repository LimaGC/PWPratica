const ValidationError = require('../errors/validationError');

module.exports = (app) => {

  const findAll = async () => {
    const result = await app.db('utilizadores').select('id', 'nome', 'email', 'criado_em');
    return result;
  };

  const findOne = async (id) => {
    const result = await app.db('utilizadores').select('id', 'nome', 'email', 'criado_em').where('id', id).first();
    return result;
  };

  const findByField = async (filter) => {
    const result = await app.db('utilizadores').select('*').where(filter).first();
    return result;
  };

  return { findAll, findOne, findByField };
};

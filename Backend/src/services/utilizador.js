const ValidationError = require('../errors/validationError');
const moment = require('moment');

module.exports = (app) => {

  const findAll = async () => {
    const result = await app.db('utilizadores').select('*');
    return result;
  };

  const findOne = async (id) => {
    const result = await app.db('utilizadores').select('*').where('id', id).first();
    return result;
  };

  const findByField = async (filter) => {
    const result = await app.db('utilizadores').select('*').where(filter).first();
    return result;
  };

  const save = async (dataset) => {
    if (!dataset.nome) throw new ValidationError('O campo [Nome] é obrigatório!');

    const newDataset = { ...dataset };
    newDataset.criado_em = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await app.db('utilizadores').insert(newDataset, '*');
    return result;
  };

  const update = async (id, dataset) => {
    const newDataset = { ...dataset };
    const result = await app.db('utilizadores').where('id', id).update(newDataset, '*');
    return result;
  };

  const remove = async (id) => {
    const result = await app.db('utilizadores').where('id', id).del();
    return [];
  };

  return { findAll, findOne, save, update, remove, findByField };
};

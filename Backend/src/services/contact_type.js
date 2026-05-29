const ValidationError = require('../errors/validationError');
const moment = require('moment');

module.exports = (app) => {

  const findAll = async () => {
    const result = await app.db('contacts_type').select('*');
    return result;
  };

  const findOne = async (id) => {
    const result = await app.db('contacts_type').select('*').where('id', id).first();
    return result;
  };

  const findByField = async (filter) => {
    const result = await app.db('contacts_type').select('*').where(filter).first();
    return result;
  };

  const save = async (dataset) => {
    if (!dataset.type_name) throw new ValidationError('O campo [Type Name] é obrigatório!');
    
    const newDataset = { ...dataset };
    newDataset.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await app.db('contacts_type').insert(newDataset, '*');
    return result;
  };

  const update = async (id, dataset) => {
    const newDataset = { ...dataset };
    newDataset.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await app.db('contacts_type').where('id', id).update(newDataset, '*');
    return result;
  };

  const remove = async (id) => {
    const result = await app.db('contacts_type').where('id', id).del();
    return [];
  };

  return { findAll, findOne, save, update, remove, findByField };
};
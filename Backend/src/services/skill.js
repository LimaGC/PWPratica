const ValidationError = require('../errors/validationError');
const moment = require('moment');

module.exports = (app) => {

  const findAll = async () => {
    const result = await app.db('skills').select('*');
    return result;
  };

  const findOne = async (id) => {
    const result = await app.db('skills').select('*').where('id', id).first();
    return result;
  };

  const findByField = async (filter) => {
    const result = await app.db('skills').select('*').where(filter).first();
    return result;
  };

  const save = async (dataset, token) => {
    if (!dataset.skill_desc) throw new ValidationError('O campo [Skill Desc] é obrigatório!');
    
    const newDataset = { ...dataset };
    newDataset.user_id = token.id
    newDataset.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await app.db('skills').insert(newDataset, '*');
    return result;
  };

  const update = async (id, dataset, token) => {
    const skill = await findOne(id);
    if (skill.user_id != token.id) throw new ValidationError('Não tem permissão para atualizar');
    const newDataset = { ...dataset };
    newDataset.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await app.db('skills').where('id', id).update(newDataset, '*');
    return result;
  };

  const remove = async (id, token) => {
    const skill = await findOne(id);
    if (skill.user_id != token.id) throw new ValidationError('Não tem permissão para remover');
    const result = await app.db('skills').where('id', id).del();
    return [];
  };

  return { findAll, findOne, save, update, remove, findByField };
};
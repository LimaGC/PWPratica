const ValidationError = require('../errors/validationError');

module.exports = (app) => {

  const findAll = async () => {
    const result = await app.db('livros').select('*');
    return result;
  };

  const findAllAvailable = async () => {
    const result = await app.db('livros').select('*').where('estado', 'disponivel');
    return result;
  };

  const findOne = async (id) => {
    const result = await app.db('livros').select('*').where('id', id).first();
    return result;
  };

  const findByField = async (filter) => {
    const result = await app.db('livros').select('*').where(filter).first();
    return result;
  };

  const save = async (dataset) => {
    if (!dataset.titulo) throw new ValidationError('O campo [Titulo] é obrigatório!');
    if (!dataset.autor) throw new ValidationError('O campo [Autor] é obrigatório!');
    if (!dataset.isbn) throw new ValidationError('O campo [ISBN] é obrigatório!');

    const newDataset = { ...dataset };
    if (!newDataset.estado) newDataset.estado = 'disponivel';
    const result = await app.db('livros').insert(newDataset, '*');
    return result;
  };

  const update = async (id, dataset) => {
    const newDataset = { ...dataset };
    const result = await app.db('livros').where('id', id).update(newDataset, '*');
    return result;
  };

  const remove = async (id) => {
    const result = await app.db('livros').where('id', id).del();
    return [];
  };

  return { findAll, findAllAvailable, findOne, save, update, remove, findByField };
};

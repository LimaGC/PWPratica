const ValidationError = require('../errors/validationError');

module.exports = (app) => {

  const findAll = async (token) => {
    const result = await app.db('reservas').select('*').where('utilizador_id', token.id);
    return result;
  };

  const findOne = async (id) => {
    const result = await app.db('reservas').select('*').where('id', id).first();
    return result;
  };

  const findByField = async (filter) => {
    const result = await app.db('reservas').select('*').where(filter).first();
    return result;
  };

  const save = async (dataset, token) => {
    if (!dataset.livro_id) throw new ValidationError('O campo [Livro Id] é obrigatório!');

    const livro = await app.db('livros').where('id', dataset.livro_id).first();
    if (!livro) throw new ValidationError('Livro não encontrado!');
    if (livro.estado !== 'disponivel') throw new ValidationError('Livro não está disponível!');

    const newDataset = {
      utilizador_id: token.id,
      livro_id: dataset.livro_id,
      estado: dataset.estado || 'ativa',
    };
    const result = await app.db('reservas').insert(newDataset, '*');
    await app.db('livros').where('id', dataset.livro_id).update({ estado: 'reservado' });
    return result;
  };

  const update = async (id, dataset, token) => {
    const reserva = await findOne(id);
    if (!reserva) throw new ValidationError('Reserva não encontrada!');
    if (reserva.utilizador_id != token.id) throw new ValidationError('Não tem permissão para atualizar');

    const newDataset = { ...dataset };
    const result = await app.db('reservas').where('id', id).update(newDataset, '*');

    if (newDataset.estado === 'cancelada' && reserva.estado !== 'cancelada') {
      await app.db('livros').where('id', reserva.livro_id).update({ estado: 'disponivel' });
    }
    return result;
  };

  const remove = async (id, token) => {
    const reserva = await findOne(id);
    if (!reserva) throw new ValidationError('Reserva não encontrada!');
    if (reserva.utilizador_id != token.id) throw new ValidationError('Não tem permissão para remover');

    const result = await app.db('reservas').where('id', id).del();
    if (reserva.estado !== 'cancelada') {
      await app.db('livros').where('id', reserva.livro_id).update({ estado: 'disponivel' });
    }
    return [];
  };

  return { findAll, findOne, save, update, remove, findByField };
};

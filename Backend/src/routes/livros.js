const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/:id', (req, res, next) => {
    app.services.livro.findOne(req.params.id)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.livro.save(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.put('/:id', (req, res, next) => {
    app.services.livro.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.livro.remove(req.params.id)
      .then((result) => res.status(204).json())
      .catch((err) => next(err));
  });

  return router;
};

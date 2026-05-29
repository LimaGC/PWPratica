const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.contact_type.findAll()
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.contact_type.findOne(req.params.id)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.contact_type.save(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.put('/:id', (req, res, next) => {
    app.services.contact_type.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.contact_type.remove(req.params.id)
      .then((result) => res.status(204).json())
      .catch((err) => next(err));
  });

  return router;
};
const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.skill.findAll()
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.skill.findOne(req.params.id)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.skill.save(req.body, req.user);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.put('/:id', (req, res, next) => {
    app.services.skill.update(req.params.id, req.body, req.user)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.skill.remove(req.params.id, req.user)
      .then((result) => res.status(204).json())
      .catch((err) => next(err));
  });

  return router;
};
const express = require('express');

module.exports = (app) => {
  app.use('/auths', app.routes.auths);

  // /livros — GET / é publico (lista apenas 'disponivel'); restantes metodos sao privados
  app.use('/livros', app.routes.livros_publicos);
  app.use('/livros', app.config.passport.authenticate(), app.routes.livros);

  // /reservas — todas as rotas privadas
  app.use('/reservas', app.config.passport.authenticate(), app.routes.reservas);

  // Rotas legacy continuam debaixo do /v1
  const standardRouter = express.Router();
  standardRouter.use('/names', app.routes.names);
  standardRouter.use('/contactstypes', app.routes.contacts_types);
  standardRouter.use('/skills', app.routes.skills);

  app.use('/v1', app.config.passport.authenticate(), standardRouter);
};

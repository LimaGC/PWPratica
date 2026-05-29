const express = require('express');

module.exports = (app) => {
  app.use('/auths', app.routes.auths);
  app.use('/livros', app.routes.livros_publicos);

  const standardRouter = express.Router();
  standardRouter.use('/names', app.routes.names);
  standardRouter.use('/contactstypes', app.routes.contacts_types);
  standardRouter.use('/skills', app.routes.skills);
  standardRouter.use('/livros', app.routes.livros);
  standardRouter.use('/reservas', app.routes.reservas);

  app.use('/v1', app.config.passport.authenticate(), standardRouter);
};

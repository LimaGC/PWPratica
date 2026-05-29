const express = require('express');

module.exports = (app) => {
  app.use('/auths', app.routes.auths);
  
  const standardRouter = express.Router();
  standardRouter.use('/names', app.routes.names);
  standardRouter.use('/contactstypes', app.routes.contacts_types);
  standardRouter.use('/skills', app.routes.skills);

  app.use('/v1', app.config.passport.authenticate(), standardRouter);
};

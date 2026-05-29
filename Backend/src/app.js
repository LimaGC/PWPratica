const { v4: uuidv4 } = require('uuid');

const app = require('express')();
const consign = require('consign');

const knex = require('knex');
const config = require('./config');
const knexfile = require('../knexfile');

// app.db = knex(knexfile.development);
app.db = knex(knexfile[config.NODE_ENV]);

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).json({ debug: 'App: Programação Web 202526'});
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'validationError') res.status(400).json({ error: message });
  else if (name === 'forbiddenError') res.status(403).json({ error: message });
  else if (name === 'authenticationError') res.status(400).json({ error: message });
  else {
    const id = uuidv4();
    console.log(message);
    //app.log.error({
    //  id, name, message, stack,
    //});
    res.status(500).json({ id, error: 'System error. Please concact admin!' });
  }
  next(err);
});

module.exports = app;

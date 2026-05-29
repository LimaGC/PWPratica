const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, `./env/${process.env.NODE_ENV}.env`),
});

//console.log(`Directory: ${__dirname}`);
//console.log(`KnexConfig / using environment: ${process.env.NODE_ENV}`);
//console.log(`KnexConfig / using PostGres: ${process.env.POSTGRES_VERSION}`);

module.exports = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: 'data/database.sqlite'
    },
    debug: false,
    useNullAsDefault: true,
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds/test' },
  },
  staging: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: '5432',
      user: 'ersc',
      password: 'xpto12345',
      database: 'web',
    },
    debug: false,
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds/test' },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    debug: false,
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds/production' },
    pool: {
      min: 0,
      max: 50,
      propagateCreateError: false,
    },
  },
};

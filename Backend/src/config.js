const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({
  path: path.resolve(__dirname, `../env/${process.env.NODE_ENV}.env`),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'test',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3001,
};

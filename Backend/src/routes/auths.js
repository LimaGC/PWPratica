const express = require('express');
const jwt = require('jwt-simple');
const jsonwebtoken = require('jsonwebtoken');
const bcryptUp = require('bcrypt');
// const bcrypt = require('bcrypt-nodejs');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const AuthenticationError = require('../errors/authenticationError');
const config = require('../config');

const secret = 'ERSC202526';

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', (req, res, next) => {
    app.services.name.findByField({ email: req.body.email })
      .then(async (user) => {
        console.log(user);
        if (bcryptUp.compareSync(req.body.pass, user.pass)) {
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            expires: Date.now() + (1000 * 60 * 60), // expire: Date.now() + (1000 * 60 * 60) - 1 hour
          };
          const token = jwt.encode(payload, secret);
          res.status(200).json({ token });
        } else {
          throw new AuthenticationError('Autentication Error');
        }
      }).catch((err) => next(err));
  });

  return router;
};

module.exports = function authenticationError(message) {
  this.name = 'authenticationError';
  this.message = message;
};

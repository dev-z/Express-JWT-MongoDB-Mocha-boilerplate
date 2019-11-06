/**
 * POST /auth/login                   Validate credentials, return user, access token, refresh token
 * POST /auth/logout                  Blacklist refresh token
 * POST /auth/password/reset          Create a password reset request
 * POST /auth/password/reset/confirm  Allow user to set new password based on previous reset request
 * POST /auth/password/change         Allow user to change password. Requires log in.
 */
const authenticationService = require('../services/authentication');

module.exports = function authRoutes(router) {
  // route to authenticate a user (POST http://localhost:8080/api/v1/auth/login)
  router.route('/auth/login').post((req, res) => {
    authenticationService
      .authenticate(req.body)
      .then((data) => {
        res.status(200).json(data);
      }, (err) => {
        res.status(400).json(err);
      });
  });
};

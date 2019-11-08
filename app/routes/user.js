/**
 * GET      /users          - Retrieves a list of users
 * POST     /users          - Creates a new user. (Code in unprotected routes)
 * GET      /users/:user_id - Retrieves a specific user
 * PUT      /users/:user_id - Updates a specific user
 * DELETE   /users/:user_id - Deletes a specific user
 */
const userService = require('../services/user');
const { ERROR_CODES } = require('../constants');

module.exports = function userRoutes(router) {
  // --------------------------------------------------------------------------------------------
  // on routes that end in /users
  // --------------------------------------------------------------------------------------------
  router.route('/users')
    /**
     * @desc Get all Users (accessed at GET http://host:port/api/users?prop1=val1&prop2=val2&sort=-prop1,prop2)
     */
    .get((req, res) => {
      userService.read(req.query).then((users) => {
        res.status(users.statusCode || 200).json(users);
      }, (err) => {
        res.status(err.statusCode || 400).json(err);
      });
    });
  // --------------------------------------------------------------------------------------------
  // on routes that end in /users/:user_id
  // --------------------------------------------------------------------------------------------
  router.route('/users/:user_id')
    /**
     * @desc get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
     */
    .get((req, res) => {
      userService.read(req.params).then((user) => {
        res.status(user.statusCode || 200).json(user);
      }, (err) => {
        res.status(err.statusCode || 400).json(err);
      });
    })
    /**
     * @desc update the user with this id (accessed at PUT http://localhost:8080/api/users/:user_id)
     */
    .put((req, res) => {
      // Check permission
      const requestedData = { userId: req.params.user_id };
      if (userService.isAuthorised(requestedData, req.requesterData)) {
        userService.update(req.params.user_id, req.body).then((user) => {
          res.status(user.statusCode || 200).json(user);
        }, (err) => {
          res.status(err.statusCode || 400).json(err);
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to carry out this operation.',
          errorCode: ERROR_CODES.FORBIDDEN,
          statusCode: 403,
        });
      }
    })
    /**
     * @desc delete the user with this id (accessed at DELETE http://localhost:8080/api/users/:user_id)
     */
    .delete((req, res) => {
      // Check permission
      const requestedData = { userId: req.params.user_id };
      if (userService.isAuthorised(requestedData, req.requesterData)) {
        userService.update(req.params.user_id, { isDeleted: true }).then((data) => {
          res.status(data.statusCode || 200).json(data);
        }, (err) => {
          res.status(err.statusCode || 400).json(err);
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to carry out this operation.',
          error: ERROR_CODES.FORBIDDEN,
          statusCode: 403,
        });
      }
    });
};

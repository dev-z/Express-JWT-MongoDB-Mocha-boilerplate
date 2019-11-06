const userService = require('../services/user');

module.exports = function userUnpRoutes(router) {
  router.route('/users')
    /**
     * @desc Create a User (accessed at POST http://host:port/api/v1/users)
     */
    .post((req, res) => {
      userService.create(req.body).then((users) => {
        res.status(200).json(users);
      }, (err) => {
        res.status(400).json(err);
      });
    });
};

module.exports = function authRoutes(router) {
  // route to authenticate a user (POST http://localhost:8080/api/v1/authentication)
  router.route('/authentication').post((req, res) => {
    global.authenticationService.authenticate(req.body.email, req.body.password).then((data) => {
      res.status(200).json(data);
    }, (err) => {
      res.status(400).json(err);
    });
  });
};

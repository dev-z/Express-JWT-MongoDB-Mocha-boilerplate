const humps = require('humps');
const jwt = require('jsonwebtoken');

const { ERROR_CODES } = require('../constants');

module.exports = (function getMiddlewares() {
  /**
   * Converts snake_case to camelCase
   * @param {Object} req The incoming request
   * @param {Object} res Response object
   * @param {Function} next call the next action
   */
  function camelizer(req, res, next) {
    req.body = humps.camelizeKeys(req.body);
    next();
  }

  function JWTVerifier(req, res, next) {
    // Authenticating the incoming requests for all routes listed below this function.
    // check header or url parameters for token
    const token = req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).json({
            success: false,
            message: 'Failed to authenticate token.',
            errorCode: ERROR_CODES.UNAUTHORISED,
            statusCode: 401,
          });
        } else {
          // if everything is good, save payload details in request object for use in other routes
          req.requesterData = decoded;
          next();
        }
      });
    } else {
      // if there is no token, return an error
      res.status(401).json({
        success: false,
        message: 'No token provided. Please refer to docs to how to send your token.',
        errorCode: ERROR_CODES.NO_TOKEN,
        statusCode: 401,
      });
    }
  }

  return {
    camelizer,
    JWTVerifier,
  };
}());

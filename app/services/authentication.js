const User = require('../models/User');
const { GRANT_TYPES, ERROR_CODES, AUTH_TOKEN_TYPE } = require('../constants');

module.exports = (function authentication() {
  /**
   * @author Ishtiaque
   * @desc Authenticates a User based on email and password.
   * Returns user details and tokens
   * @param {String} email
   * @param {String} password
   * @returns {Promise}
   */
  function authenticateByPassword(email, password) {
    if (!(email && password)) {
      return Promise.reject({
        success: false,
        message: 'Missing email or password',
        errorCode: ERROR_CODES.MISSING_REQUIRED_FIELD,
        statusCode: 400,
      });
    }
    if (!(typeof email === 'string' && typeof password === 'string')) {
      return Promise.reject({
        success: false,
        message: 'Invalid format. Email and Password should be strings.',
        errorCode: ERROR_CODES.INVALID_FIELD_VALUE,
        statusCode: 400,
      });
    }
    return new Promise((resolve, reject) => {
      // find the user
      User.findOne({ email },
        'name email mobile +password dob doj +isDeleted +isAdmin +isEmailVerified',
        (err, user) => {
          if (err) {
            console.error(err);
            reject({
              success: false,
              message: 'Some error occurred. Please try again later',
              errorCode: ERROR_CODES.USER.READ_FAILED,
              statusCode: 500,
            });
          } else if (!user) {
            reject({
              success: false,
              message: 'Authentication failed. User not found.',
              errorCode: ERROR_CODES.USER.NOT_FOUND,
              statusCode: 404,
            });
          } else if (user) {
            // check if account is deleted
            if (user.isDeleted) {
              reject({
                success: false,
                message: 'Your account is not active.',
                errorCode: ERROR_CODES.USER.INACTIVE,
                statusCode: 404,
              });
            } else if (!user.isEmailVerified) {
              reject({
                success: false,
                message: 'Your account is not verified.',
                errorCode: ERROR_CODES.USER.EMAIL_NOT_VERIFIED,
                statusCode: 403,
              });
            } else {
              user.comparePassword(password, (hashErr, isMatch) => {
                if (hashErr) {
                  console.error(hashErr);
                  reject({
                    success: false,
                    message: 'Invalid credentials.',
                    errorCode: ERROR_CODES.USER.INVALID_CREDENTIALS,
                    statusCode: 400,
                  });
                } else if (!isMatch) {
                  reject({
                    success: false,
                    message: 'Invalid credentials.',
                    errorCode: ERROR_CODES.USER.INVALID_CREDENTIALS,
                    statusCode: 400,
                  });
                } else {
                  const userObj = user.toClient();
                  const accessToken = user.createAccessToken();
                  const refreshToken = user.createRefreshToken();
                  // return the information including token as JSON
                  resolve({
                    statusCode: 200,
                    success: true,
                    message: 'Authentication successfull!',
                    token_type: AUTH_TOKEN_TYPE,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: userObj,
                  });
                }
              });
            }
          }
        });
    });
  }

  /**
   * Authenticates a user based on the refresh token
   * Returns a access_token and refresh_token
   * @param {String} refreshToken Refresh token
   * @returns {Promise}
   */
  function authenticateByRefreshToken(refreshToken) {
    return new Promise((resolve) => resolve({
      message: 'Not implemented',
      refresh_token: refreshToken,
    }));
  }

  function authenticate(body) {
    return new Promise((resolve, reject) => {
      if (!body.grantType) {
        reject({
          success: false,
          message: '"grant_type" field is required',
          errorCode: ERROR_CODES.MISSING_REQUIRED_FIELD,
          statusCode: 400,
        });
      } else if (body.grantType === GRANT_TYPES.REFRESH_TOKEN) {
        authenticateByRefreshToken(body.refresh_token)
          .then((res) => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      } else if (body.grantType === GRANT_TYPES.PASSWORD) {
        authenticateByPassword(body.email, body.password)
          .then((res) => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      } else {
        reject({
          success: false,
          message: '"grant_type" has invalid value',
          errorCode: ERROR_CODES.INVALID_FIELD_VALUE,
          statusCode: 400,
        });
      }
    });
  }

  return {
    authenticate,
  };
}());

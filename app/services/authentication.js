module.exports = function authentication() {
  /**
   * @author Ishtiaque
   * @desc Authenticates a User and gives him a token to be used for later requests.
   * @param {String} email
   * @param {String} password
   * @returns {Promise.<Object|Object>} Object when promise is fulfilled,
   * Object when promise is rejected.
   * { success: <Boolean>, message: <String>, error: <Any>, token: <String>, user: <Object> }
   */
  function authenticate(email, password) {
    if (!(typeof email === 'string' && typeof password === 'string')) {
      const errPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject({
            success: false,
            message: 'Invalid format. Email and Password should be strings. }',
            error: 'INVALID_FORMAT',
          });
        });
      });
      return errPromise;
    }
    const promise = new Promise((resolve, reject) => {
      // find the user
      global.User.findOne({ email },
        'name email mobile +password areasOfInterest subscribedChannels dob doj +isDeleted +isAdmin +isEmailVerified',
        (err, user) => {
          if (err) {
            reject({
              success: false,
              message: 'Bad Request.',
              error: err,
            });
          } else if (!user) {
            resolve({ success: false, message: 'Authentication failed. User not found.' });
          } else if (user) {
            // check if account is deleted
            if (user.isDeleted) {
              resolve({ success: false, message: 'Your account is not active.' });
            } else if (!user.isEmailVerified) {
              resolve({ success: false, message: 'Your account is not verified.' });
            } else if (user.password !== password) { // check if password matches
              resolve({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {
              const userObj = {
                _id: user._id, // eslint-disable-line
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                dob: user.dob,
                doj: user.doj,
                areasOfInterest: user.areasOfInterest,
                subscribedFeeds: user.subscribedFeeds,
              };
              const requesterData = {
                _id: user._id, // eslint-disable-line
                email: user.email,
                isAdmin: user.isAdmin,
              };
              // if user is found and password is right
              // create a token
              const token = global.jwt.sign(requesterData, process.env.JWT_SECRET, {
                expiresIn: '24h', // expires in 24 hours
                issuer: 'flashcards.in',
              });

              // return the information including token as JSON
              resolve({
                success: true,
                message: 'Authentication successfull!',
                token,
                user: userObj,
              });
            }
          }
        });
    });
    return promise;
  }

  return {
    authenticate,
  };
};

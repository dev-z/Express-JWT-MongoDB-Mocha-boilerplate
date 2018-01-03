module.exports = function userService() {
  /**
   * @author Ishtiaque
   * @desc Creates a single user and returns the saved User document on success.
   * @param {Object} document User document.
   * @returns {Promise.<User|Object>} User on success, Object on failure.
   */
  function create(document) {
    const promise = new Promise((resolve, reject) => {
      /* if (document) { */
      const instance = new global.User(document);
      // If in prod or dev env (any env except testing),
      // isEmailVerified should be false irrespective of what was passed.
      if (process.env.ENV !== 'test') {
        instance.isEmailVerified = false;
      }
      // Mongoose registers validation as a pre('save') hook on every schema by default.
      // http://mongoosejs.com/docs/validation.html
      instance.save((err, user) => {
        if (err) {
          reject({
            message: err.message ? err.message : 'User creation failed',
            error: err.name,
            code: err.code,
          });
        } else {
          resolve(user);
        }
      });
      /* } else {
        setTimeout(() => {
          reject({
            message: 'Invalid Format. Please pass user data as { prop1: val1, prop2: val2, ... } ',
            error: 'INVALID_FORMAT',
          });
        });
      } */
    });
    return promise;
  } // End create()

  /**
   * @author Ishtiaque
   * @desc Returns a single user or multiple user based on the search filters passed.
   * @param {Object|Array} document User document or Array of User documents.
   * @returns {Promise.<User|Object>} User or [User] on success, Object on failure.
   */
  function read(rawFilters) {
    const promise = new Promise((resolve, reject) => {
      if (rawFilters && rawFilters.user_id && (typeof rawFilters.user_id === 'string')) {
        // Single User
        global.User.findById(rawFilters.user_id, (err, user) => {
          if (err) {
            reject(err);
          } else if (!user) {
            resolve({
              message: 'User not found',
              error: '404',
            });
          } else {
            resolve(user);
          }
        });
      } else {
        // Multiple Users
        // eslint-disable-next-line
        const filters = parseFilters(rawFilters);
        let limit;
        let skip;
        if (rawFilters.limit && rawFilters.skip) {
          limit = Number(rawFilters.limit);
          skip = Number(rawFilters.skip);
        }
        global.User
          .find(filters)
          .limit(limit)
          .skip(skip)
          .exec((err, users) => {
            if (err) {
              reject(err);
            } else {
              resolve(users);
            }
          });
      }
    });
    return promise;
  } // End read()

  /**
   * @author Ishtiaque
   * @desc Updates a single user, matched by id.
   * @param {String} id User ID.
   * @param {Object} document The user document or an object containing properties to be updated.
   * @returns {Promise.<User|Object>} Updated User on success, Object on failure.
   */
  function update(id, document) {
    const promise = new Promise((resolve, reject) => {
      if (!(id && document)) {
        setTimeout(() => {
          reject({
            message: 'Missing User ID or data to be updated. Please pass data to be updated as { prop1: val1, prop2: val2, ... } }',
            error: 'MISSING_REQ_PARAM',
          });
        });
      } else {
        let docToUpdate;
        if (document.isDeleted) {
          // If isDeleted is true, then set only isDeleted field
          docToUpdate = { isDeleted: true };
        } else {
          // otherwise remove those uneditable fields if present.
          // eslint-disable-next-line
          docToUpdate = removeUnupdatableFields(document);
        }

        global.User.findByIdAndUpdate(id,
          { $set: docToUpdate },
          { new: true, strict: true, runValidators: true },
          (err, updtUser) => {
            if (err) {
              reject({
                message: 'Failed to delete User',
                error: err,
              });
            } else if (docToUpdate.isDeleted) {
              resolve({
                success: true,
                message: 'User successfully deleted.',
              });
            } else if (!updtUser) {
              resolve({
                message: 'User not found',
                error: '404',
              });
            } else {
              resolve(updtUser);
            }
          });
      }
    });
    return promise;
  } // End update()

  /**
   * @author Ishtiaque
   * @desc Deletes a user for a given id. This deletes the data from the DB. FOR INTERNAL USE ONLY.
   * @param {String} id ID of the User to be deleted permanently.
   * @returns {Promise.<Object|Object>}
   */
  function del(id) {
    const promise = new Promise((resolve, reject) => {
      if (!id) {
        setTimeout(() => {
          reject({
            message: 'Missing ID',
            error: 'MISSING_REQ_PARAM',
          });
        });
      } else {
        global.User.remove({
          _id: id,
        }, (err, user) => {
          if (err) {
            reject(err);
          } else {
            resolve(user);
          }
        });
      }
    });
    return promise;
  } // End del()

  // --- PRIVATE FUNCTIONS --- //

  /**
   * Removes the unupdateable fields from document. Prevents accidental update of these fields.
   * @param {Object} document
   * @returns {Object}
   */
  function removeUnupdatableFields(document) {
    // Create a copy of document to prevent mutating document.
    const data = JSON.parse(JSON.stringify(document));
    // Delete critical fields.
    delete data._id; // eslint-disable-line
    delete data.email;
    delete data.password;
    delete data.doj;
    delete data.subscribedFeeds;
    if (data.isDeleted) {
      // This allows to update the 'isDeleted' field to false, but not true.
      delete data.isDeleted;
    }

    return data;
  }

  /**
   * @desc [PRIVATE] Takes in the query params and converts it into filter, sort and join.
   * @param {Object} rawFilters The filter object recieved from the query params
   * @returns {Object}
   */
  function parseFilters(rawFilters) {
    if (!rawFilters) {
      return null;
    }
    const filters = { isDeleted: false };
    // --- _id ------------------------- //
    // in
    if (rawFilters.user_id && rawFilters.user_id instanceof Array) {
      filters._id = { // eslint-disable-line
        $in: rawFilters.user_id,
      };
    }
    // --- name ------------------------ //
    // equal/in
    if (rawFilters.name) {
      if (rawFilters.name instanceof Array) {
        filters.name = {
          $in: rawFilters.name,
        };
      } else {
        filters.name = rawFilters.name;
      }
    }
    // like
    // https://stackoverflow.com/questions/9824010/mongoose-js-find-user-by-username-like-value
    if (rawFilters.nl && (typeof rawFilters.nl === 'string')) {
      const cleanInput = global.utils.regex.escapeRegExp(rawFilters.nl);
      filters.name = new RegExp(`${cleanInput}`, 'i');
    }
    // --- email ----------------------- //
    // equal/in
    if (rawFilters.email) {
      if (rawFilters.email instanceof Array) {
        filters.email = {
          $in: rawFilters.email,
        };
      } else {
        filters.email = rawFilters.email;
      }
    }
    // --- mobile ---------------------- //
    // equal/in
    if (rawFilters.mobile) {
      if (rawFilters.mobile instanceof Array) {
        filters.mobile = {
          $in: rawFilters.mobile,
        };
      } else {
        filters.mobile = rawFilters.mobile;
      }
    }
    // --- subscribedFeeds ---------------------- //
    // equal/in
    if (rawFilters.subscribed_feeds) {
      if (rawFilters.subscribed_feeds instanceof Array) {
        filters.subscribedFeeds = {
          $all: rawFilters.subscribed_feeds,
        };
      } else {
        filters.subscribedFeeds = rawFilters.subscribed_feeds;
      }
    }
    /* FEATURE NOT OFFERED RIGHT NOW. WILL BE OFFERED IF NEEDED
    // --- doj ------------------------- //
    // equal
    if (rawFilters.doj) {
      filters.doj = rawFilters.doj;
    }
    // gt
    if (rawFilters.dojgt) {
      filters.doj = {
        $gt: rawFilters.dojgt,
      };
    }
    // gte
    if (rawFilters.dojgte) {
      filters.dojgte = {
        $gte: rawFilters.dojgte,
      };
    }
    // lt
    if (rawFilters.dojlt) {
      if (filters.doj) {
        filters.doj.$lt = rawFilters.dojlt;
      } else {
        filters.doj = {
          $lt: rawFilters.dojlt,
        };
      }
    }
    // lte
    if (rawFilters.dojlte) {
      if (filters.doj) {
        filters.doj.$lte = rawFilters.dojlte;
      } else {
        filters.doj = {
          $lte: rawFilters.dojlte,
        };
      }
    }

    // --- dob ------------------------- //
    // equal
    if (rawFilters.dob) {
      filters.dob = rawFilters.dob;
    }
    // gt
    if (rawFilters.dobgt) {
      filters.dob = {
        $gt: rawFilters.dobgt,
      };
    }
    // gte
    if (rawFilters.dobgte) {
      filters.dobgte = {
        $gte: rawFilters.dobgte,
      };
    }
    // lt
    if (rawFilters.doblt) {
      if (filters.dob) {
        filters.dob.$lt = rawFilters.doblt;
      } else {
        filters.dob = {
          $lt: rawFilters.doblt,
        };
      }
    }
    // lte
    if (rawFilters.doblte) {
      if (filters.dob) {
        filters.dob.$lte = rawFilters.doblte;
      } else {
        filters.dob = {
          $lte: rawFilters.doblte,
        };
      }
    }
    */
    return filters;
  }

  /**
   * @desc Checks if the user is authorised to hit the endpoint
   * @param {Object} requested Contains details for the requested action/endpoint.
   * @param {Object} requester Details of user who has hit this api endpoint.
   * @returns {Boolean}
   */
  function isAuthorised(requested, requester) {
    // Check if user_id passed is equal to the requestor's id or not.
    // This does not allow a user to update someone else's account. (Except for admin account)
    if (requester._id === requested.userId) { // eslint-disable-line
      return true;
    } else if (requester.isAdmin) {
      return true;
    }
    return false;
  }

  return {
    create,
    read,
    update,
    del,
    isAuthorised,
  };
};

// Importing models
const User = require('../models/User');
const userUtils = require('../utils/user.utils');
const { ERROR_CODES } = require('../constants');

module.exports = (function userService() {
  // ================================= Public methods ================================= //
  /**
   * @author Ishtiaque
   * @desc Creates a single user and returns the saved User document on success.
   * @param {Object} document User document.
   * @returns {Promise.<User|Object>} User on success, Object on failure.
   */
  function create(document) {
    const promise = new Promise((resolve, reject) => {
      const instance = new User(document);
      // If in any env except testing,
      // isEmailVerified should be false irrespective of what was passed.
      if (process.env.NODE_ENV !== 'test') {
        instance.isEmailVerified = false;
      }
      // Mongoose registers validation as a pre('save') hook on every schema by default.
      // http://mongoosejs.com/docs/validation.html
      instance.save((err, user) => {
        if (err) {
          const errRes = userUtils.decodeError(err);
          reject(errRes);
        } else {
          resolve(user.toClient());
        }
      });
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
        User.findById(rawFilters.user_id, (err, user) => {
          if (err) {
            console.error(err);
            reject({
              success: false,
              message: 'Something went wrong',
              statusCode: 500,
              errorCode: ERROR_CODES.USER.READ_FAILED,
            });
          } else if (!user) {
            reject({
              success: true,
              message: 'User not found',
              statusCode: 404,
              errorCode: ERROR_CODES.USER.NOT_FOUND,
            });
          } else {
            resolve(user.toClient());
          }
        });
      } else {
        // Multiple Users
        const filters = userUtils.parseFilters(rawFilters);
        let limit;
        let skip;
        if (rawFilters.limit && rawFilters.skip) {
          limit = Number(rawFilters.limit);
          skip = Number(rawFilters.skip);
        }
        User
          .find(filters)
          .limit(limit)
          .skip(skip)
          .exec((err, users) => {
            if (err) {
              console.error(err);
              reject({
                success: false,
                message: 'Something went wrong',
                statusCode: 500,
                errorCode: ERROR_CODES.USER.READ_FAILED,
              });
            } else {
              resolve(users.map((user) => user.toClient()));
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
    if (!(id && document)) {
      Promise.reject({
        success: false,
        message: 'Missing User ID or data to be updated. Please pass data to be updated as { prop1: val1, prop2: val2, ... } }',
        errorCode: ERROR_CODES.MISSING_REQUIRED_FIELD,
        statusCode: 400,
      });
    }
    return new Promise((resolve, reject) => {
      let docToUpdate;
      if (document.isDeleted) {
        // If isDeleted is true, then set only isDeleted field
        docToUpdate = { isDeleted: true };
      } else {
        // otherwise remove those uneditable fields if present.
        docToUpdate = userUtils.removeUnupdatableFields(document);
      }

      User.findByIdAndUpdate(
        id,
        { $set: docToUpdate },
        { new: true, strict: true, runValidators: true },
        (err, updtUser) => {
          if (err) {
            let message = 'Failed to update user';
            let errorCode = ERROR_CODES.USER.UPDATE_FAILED;
            if (docToUpdate.isDeleted) {
              message = 'Failed to delete user';
              errorCode = ERROR_CODES.USER.DELETE_FAILED;
            }
            console.error(err);
            reject({
              success: false,
              message,
              statusCode: 500,
              errorCode,
            });
          } else if (!updtUser) {
            reject({
              success: false,
              message: 'User not found',
              statusCode: 404,
              errorCode: ERROR_CODES.USER.NOT_FOUND,
            });
          } else if (docToUpdate.isDeleted) {
            resolve({
              success: true,
              message: 'User successfully deleted.',
              statusCode: 200,
            });
          } else {
            resolve(updtUser.toClient());
          }
        },
      );
    });
  } // End update()

  /**
   * @author Ishtiaque
   * @desc Deletes a user for a given id. This deletes the data from the DB.
   * FOR INTERNAL USE ONLY.
   * To flag the user as deleted, please use the update method.
   * @param {String} id ID of the User to be deleted permanently.
   * @returns {Promise.<Object|Object>}
   */
  function del(id) {
    if (!id) {
      return Promise.reject({
        success: false,
        message: 'Missing ID',
        statusCode: 400,
        errorCode: 'MISSING_REQ_PARAM',
      });
    }
    return new Promise((resolve, reject) => {
      User.deleteOne({
        _id: id,
      }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user.toClient());
        }
      });
    });
  } // End del()

  /**
   * @desc Checks if the user is authorised to hit the endpoint
   * @param {Object} requested Contains details for the requested action/endpoint.
   * @param {Object} requester Details of user who has hit this api endpoint.
   * @returns {Boolean}
   */
  function isAuthorised(requested, requester) {
    // Check if user_id passed is equal to the requestor's id or not.
    // This does not allow a user to update someone else's account. (Except for admin account)
    return ((requester.id === requested.userId) || requester.isAdmin);
  }

  return {
    create,
    read,
    update,
    del,
    isAuthorised,
  };
}());

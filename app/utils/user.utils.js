const regexUtils = require('./regex');
const { ERROR_CODES } = require('../constants');

module.exports = (function userUtils() {
  /**
   * Removes the unupdateable fields from document. Prevents accidental update of these fields.
   * @param {Object} document
   * @returns {Object}
   */
  function removeUnupdatableFields(document) {
    // Create a copy of document to prevent mutating document.
    const data = JSON.parse(JSON.stringify(document));
    // Delete critical fields
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
   * Transforms the system error to human understandable format
   * @param {Object} err mongo err object
   */
  function decodeError(err) {
    switch (err.code) {
      case 11000:
        return {
          success: false,
          message: 'Email already exists',
          errorCode: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          statusCode: 400,
        };
      default:
        return {
          success: false,
          message: err.message || 'User creation failed',
          errorCode: err.code || ERROR_CODES.REQUEST_FAILED,
          statusCode: 400,
        };
    }
  }

  /**
   * Takes in the query params and converts it into filter, sort and join.
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
      const cleanInput = regexUtils.escapeRegExp(rawFilters.nl);
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

  return {
    removeUnupdatableFields,
    decodeError,
    parseFilters,
  };
}());

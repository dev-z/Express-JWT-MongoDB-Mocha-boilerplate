const mongoose = require('mongoose');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @author Ishtiaque
 * @desc Schema Definition for User and model creation
 */
module.exports = (function createUserSchema() {
  // Defining the Schema
  const { Schema } = mongoose;
  const userSchema = new Schema({
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    email: {
      type: Schema.Types.String,
      index: true,
      unique: true,
      required: true,
      dropDups: true,
      lowercase: true,
      validate: {
        validator(v) {
          // eslint-disable-next-line
          let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(v);
        },
        message: '{VALUE} is not a valid email address!',
      },
      maxlength: 100,
    },
    mobile: { type: Schema.Types.String, minlength: 10, maxlength: 15 },
    password: { type: Schema.Types.String, required: true, select: false },
    doj: { type: Date, default: Date.now },
    dob: Date,
    isDeleted: { type: Boolean, default: false, select: false },
    isAdmin: { type: Boolean, default: false, select: false },
    isEmailVerified: { type: Boolean, default: false, select: false },
  });
  /**
   * NOTE: The strict option, (enabled by default), ensures that values passed to our model
   * constructor that were not specified in our schema do not get saved to the db.
   * Pass a 2nd param like: const userSchema = new Schema({..}, { strict: false });
   */
  // Adding virtual properties
  // Age
  userSchema.virtual('age').get(() => {
    if (!this.dob) return null;
    const now = moment.utc();
    const dob = moment.utc(this.dob);
    return now.diff(dob, 'years');
  });

  // Generate a salt and hash the password before each save
  userSchema.pre('save', function preHook(next) {
    const user = this;
    if (this.isModified('password') || this.isNew) {
      // Generate a salt
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err);
        }
        // Hash the password with generated salt
        bcrypt.hash(user.password, salt, (hErr, hash) => {
          if (hErr) {
            return next(hErr);
          }
          // Store hash in dB adjacent to password field.
          user.password = hash;
          return next();
        });
        return true;
      });
    } else {
      return next();
    }
    return true;
  });

  // For comparing the password stored in db and input from the user.
  userSchema.methods.comparePassword = function comparePassword(passwrd, cb) {
    // Compare the input password with stored hash password in dB.
    bcrypt.compare(passwrd, this.password, (err, isMatch) => {
      if (err) {
        return cb(err);
      }
      return cb(null, isMatch);
    });
  };

  userSchema.methods.createAccessToken = function createAccessToken() {
    const requesterData = {
      id: this.id,
      email: this.email,
      isAdmin: this.isAdmin,
    };
    const token = jwt.sign(requesterData, process.env.JWT_SECRET, {
      expiresIn: '15m', // expires in 15 minutes
      issuer: process.env.JWT_ISSUER || 'node-api-server',
    });
    return token;
  };

  userSchema.methods.createRefreshToken = function createRefreshToken() {
    const requesterData = {
      id: this.id,
      email: this.email,
      isAdmin: this.isAdmin,
      tokenType: 'REFRESH',
    };
    const token = jwt.sign(requesterData, process.env.JWT_SECRET, {
      expiresIn: '24h', // expires in 15 minutes
      issuer: process.env.JWT_ISSUER || 'node-api-server',
    });
    return token;
  };

  /**
   * Transforms the user object to client friendly format
   */
  userSchema.methods.toClient = function toClient() {
    const obj = this.toObject({ virtuals: true });
    // Rename fields and remove sensitive fields
    const {
      _id,
      password,
      isDeleted,
      isAdmin,
      isEmailVerified,
      __v,
      ...rest
    } = obj;
    const userData = { ...rest };

    return userData;
  };

  // Creating a Model
  const User = mongoose.model('User', userSchema);
  return User;
}());

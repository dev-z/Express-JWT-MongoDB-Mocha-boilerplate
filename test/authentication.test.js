/* eslint-disable no-unused-expressions, no-unused-vars */
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server');
const User = require('../app/models/User');
const { AUTH_TOKEN_TYPE, ERROR_CODES } = require('../app/constants');

const should = chai.should();
chai.use(chaiHttp);

describe('Authentication', () => {
  // --- Variables
  let tests = {};
  // --- HOOKS ----------------------------------------------------------------------- //
  // runs before all tests in this block
  before((done) => {
    // A little delay so the DB connection is established and _startServer() is called.
    setTimeout(() => {
      console.info('Performing pre-test cleanups.');
      // --- Clear all Models --- //
      // Clear User table
      User.deleteMany({}, (err) => {
        if (err) {
          console.error('Error in clearing User model. ', err);
        } else {
          console.info('Cleared User model.');
        }
        done();
      });
    }, 2000);
  });

  // runs after all tests in this block
  after((done) => {
    console.info('Performing after test cleanups.');
    // Clear test reults
    tests = {};
    // --- Clear all Models --- //
    // Clear User model
    User.deleteMany({}, (err) => {
      if (err) {
        console.error('Error in clearing User model after authentication tests. ', err);
      } else {
        console.info('Cleared User model.');
      }
      done();
    });
  });

  // --- TESTS ----------------------------------------------------------------------- //
  describe('/POST users', () => {
    it('[Pre-requisite] it should create a dummy user to be tested.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User1',
          email: 'testuser1@example.com',
          password: 'abcd123',
          isEmailVerified: true,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id')
              .that.is.a('string');
            tests.user = {
              ...res.body,
              password: 'abcd123',
            };
            done();
          }
        });
    });

    it('[Pre-requisite] it should create a dummy user (whose account is de-activated) to be tested.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User2',
          email: 'testuser2@example.com',
          password: 'abcd123',
          isDeleted: true,
          isEmailVerified: true,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id')
              .that.is.a('string');
            tests.delUser = {
              ...res.body,
              password: 'abcd123',
            };
            done();
          }
        });
    });

    it('[Pre-requisite] it should create a dummy user (whose account is not verified) to be tested.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User3',
          email: 'testuser3@example.com',
          password: 'abcd123',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id')
              .that.is.a('string');
            tests.unverUser = {
              ...res.body,
              password: 'abcd123',
            };
            done();
          }
        });
    });
  });

  describe('/POST auth/login', () => {
    // Valid Requests ------------------------------------------------------------------ //
    it('it should authenticate a user with correct email and password.', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: tests.user.email,
          password: tests.user.password,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.success.should.be.true;
            res.body.should.have.property('token_type')
              .that.is.a('string').that.is.equal(AUTH_TOKEN_TYPE);
            res.body.should.have.property('access_token')
              .that.is.a('string');
            res.body.should.have.property('refresh_token')
              .that.is.a('string');
            tests.authToken = res.body.access_token;
            tests.refreshToken = res.body.refresh_token;
            res.body.should.have.property('user')
              .that.is.an('object');
            res.body.user.should.not.have.property('password');
            done();
          }
        });
    });
    // Invalid Requests ---------------------------------------------------------------- //
    it('it should NOT authenticate request with no grant_type field in body', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'idonotexist@example.com',
          password: 'password',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.MISSING_REQUIRED_FIELD);
            done();
          }
        });
    });

    it('it should NOT authenticate a non-existent user (unknown email).', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: 'idonotexist@example.com',
          password: 'password',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.USER.NOT_FOUND);
            done();
          }
        });
    });

    it('it should NOT authenticate a user with wrong password.', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: tests.user.email,
          password: 'wrongPassword',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.USER.INVALID_CREDENTIALS);
            done();
          }
        });
    });

    it('it should NOT authenticate when email id is not supplied', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          password: 'wrongPassword',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.MISSING_REQUIRED_FIELD);
            done();
          }
        });
    });

    it('it should NOT authenticate when password is not supplied', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: tests.user.email,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.MISSING_REQUIRED_FIELD);
            done();
          }
        });
    });

    it('it should NOT authenticate a deactivated user.', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: tests.delUser.email,
          password: tests.delUser.password,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.USER.INACTIVE);
            done();
          }
        });
    });

    it('it should NOT authenticate a unverified user.', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: tests.unverUser.email,
          password: tests.unverUser.password,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.USER.EMAIL_NOT_VERIFIED);
            done();
          }
        });
    });

    it('it should NOT accept anything other than strings(to prevent NoSQL injection attacks).', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: {
            $ne: 1, // email not equal to 1
          },
          password: {
            $ne: 1, // password not equal to 1
          },
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should NOT allow regex expression(to prevent NoSQL injection attacks).', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: /a/,
          password: 'abcd123',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });
  });

  describe('/GET users', () => {
    it('it should check whether the token is working or not.', (done) => {
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            done();
          }
        });
    });

    it('it should not authenticate a request with no token.', (done) => {
      chai.request(server)
        .get('/api/v1/users')
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.NO_TOKEN);
            done();
          }
        });
    });

    it('it should not authenticate an invalid token.', (done) => {
      // modifying the token a little
      const invalidToken = tests.authToken.replace('a', 'b');
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', invalidToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('token_type');
            res.body.should.not.have.property('access_token');
            res.body.should.not.have.property('refresh_token');
            res.body.should.not.have.property('user');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.UNAUTHORISED);
            done();
          }
        });
    });
  });
});

/* eslint-disable prefer-arrow-callback, func-names, comma-dangle,
 no-unused-expressions, no-unused-vars */
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('../app/models/User');

const should = chai.should();

chai.use(chaiHttp);

describe('Authentication', function () {
  // --- HOOKS ----------------------------------------------------------------------- //
  // runs before all tests in this block
  before(function (done) {
    // A little delay so the DB connection is established and _startServer() is called.
    setTimeout(function () {
      // Create global variable for storing some temp data.
      global.tests = {};
      // Clear User table
      User.remove({}, function (err) {
        if (err) {
          console.error('Error in clearing User model. ', err);
        }
      });
      done();
    }, 2000);
  });
  // Before each test
  /* beforeEach(function (done) {

      done();
  }); */

  // runs after all tests in this block
  after(function (done) {
    // --- Clear global variables --- //
    global.tests = undefined;
    // --- Clear all Models --- //
    // Clear User model
    global.User.remove({}, function (err) {
      if (err) {
        console.error('Error in clearing User model after authentication tests. ', err);
      }
    });
    done();
  });

  // --- TESTS ----------------------------------------------------------------------- //
  describe('/POST users', function () {
    it('[Pre-requisite] it should create a dummy user to be tested.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User1',
          email: 'testuser1@example.com',
          password: 'abcd123',
          isEmailVerified: true,
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id')
              .that.is.a('string');
            global.tests.user = {
              id: res.body._id,
              email: res.body.email,
              password: 'abcd123',
            };
            done();
          }
        });
    });

    it('[Pre-requisite] it should create a dummy user (whose account is de-activated) to be tested.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User2',
          email: 'testuser2@example.com',
          password: 'abcd123',
          isDeleted: true,
          isEmailVerified: true,
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id')
              .that.is.a('string');
            global.tests.delUser = {
              id: res.body._id,
              email: res.body.email,
              password: 'abcd123',
            };
            done();
          }
        });
    });

    it('[Pre-requisite] it should create a dummy user (whose account is not verified) to be tested.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User3',
          email: 'testuser3@example.com',
          password: 'abcd123',
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id')
              .that.is.a('string');
            global.tests.unverUser = {
              id: res.body._id,
              email: res.body.email,
              password: 'abcd123',
            };
            done();
          }
        });
    });
  });

  describe('/POST authentication', function () {
    // Valid Requests ------------------------------------------------------------------ //
    it('it should authenticate a user with correct email and password.', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: global.tests.user.email,
          password: global.tests.user.password,
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.success.should.be.true;
            res.body.should.have.property('token')
              .that.is.a('string');
            global.tests.authToken = res.body.token;
            res.body.should.have.property('user')
              .that.is.an('object');
            done();
          }
        });
    });
    // Invalid Requests ---------------------------------------------------------------- //
    it('it should NOT authenticate a non-existent user (unknown email).', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: 'idonotexist@example.com',
          password: 'password',
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.not.have.property('token');
            res.body.success.should.be.false;
            done();
          }
        });
    });

    it('it should NOT authenticate a user with wrong password.', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: global.tests.user.email,
          password: 'wrongPassword',
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.not.have.property('token');
            res.body.success.should.be.false;
            done();
          }
        });
    });

    it('it should NOT authenticate when email id is not supplied', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          password: 'wrongPassword',
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.not.have.property('token');
          res.body.should.not.have.property('user');
          res.body.should.have.property('error').that.is.equal('INVALID_FORMAT');
          res.body.success.should.be.false;
          done();
        });
    });

    it('it should NOT authenticate when password is not supplied', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: global.tests.user.email
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.not.have.property('token');
          res.body.should.not.have.property('user');
          res.body.should.have.property('error').that.is.equal('INVALID_FORMAT');
          res.body.success.should.be.false;
          done();
        });
    });

    it('it should NOT authenticate a deactivated user.', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: global.tests.delUser.email,
          password: global.tests.delUser.password,
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.not.have.property('token');
            res.body.success.should.be.false;
            done();
          }
        });
    });

    it('it should NOT authenticate a unverified user.', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: global.tests.unverUser.email,
          password: global.tests.unverUser.password,
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.not.have.property('token');
            res.body.success.should.be.false;
            done();
          }
        });
    });

    it('it should NOT accept anything other than strings(to prevent NoSQL injection attacks).', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: {
            $ne: 1 // email not equal to 1
          },
          password: {
            $ne: 1 // password not equal to 1
          },
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.not.have.property('token');
          res.body.should.not.have.property('user');
          res.body.should.have.property('error').that.is.equal('INVALID_FORMAT');
          res.body.success.should.be.false;
          done();
        });
    });

    it('it should NOT allow regex expression(to prevent NoSQL injection attacks).', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: /a/,
          password: 'abcd123',
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.not.have.property('token');
          res.body.should.not.have.property('user');
          res.body.should.have.property('error').that.is.equal('INVALID_FORMAT');
          res.body.success.should.be.false;
          done();
        });
    });
  });

  describe('/GET users', function () {
    it('it should check whether the token is working or not.', function (done) {
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            done();
          }
        });
    });

    it('it should not authenticate a request with no token.', function (done) {
      chai.request(server)
        .get('/api/v1/users')
        .end(function (err, res) {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.should.have.property('error').that.is.equal('NO_TOKEN');
          done();
        });
    });

    it('it should not authenticate an invalid token.', function (done) {
      // modifying the token a little
      const invalidToken = global.tests.authToken.replace('a', 'b');
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', invalidToken)
        .end(function (err, res) {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('error').that.is.equal('UNAUTHORISED');
          done();
        });
    });
  });
});

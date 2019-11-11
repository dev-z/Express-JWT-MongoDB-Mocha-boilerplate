/* eslint-disable no-unused-expressions, no-unused-vars */
// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server');
const User = require('../app/models/User');

const { AUTH_TOKEN_TYPE, ERROR_CODES } = require('../app/constants');

const should = chai.should();
chai.use(chaiHttp);

describe('Users', () => {
  // --- Variables
  let tests = {};
  // --- HOOKS ----------------------------------------------------------------------- //
  // runs before all tests in this block
  before((done) => {
    // A little delay so the DB connection is established and _startServer() is called.
    setTimeout(() => {
      // Clear User model
      User.deleteMany({}, (err) => {
        if (err) {
          console.error('Error in clearing User model.', err);
        } else {
          console.info('Cleared User model.');
        }
        done();
      });
    }, 1000);
  });

  // runs after all tests in this block
  after((done) => {
    // Clear test results
    tests = {};
    // --- Clear all Models --- //
    // Clear User model
    User.deleteMany({}, (err) => {
      if (err) {
        console.error('Error in clearing User model after User tests.', err);
      } else {
        console.info('Cleared User model.');
      }
      done();
    });
  });

  // --- TESTS ----------------------------------------------------------------------- //
  // --- /POST users ----------------------------------------------------------------- //
  describe('/POST users', () => {
    it('it should create ONE User.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'John Doe',
          email: 'testuser1@example.com',
          mobile: '9876543210',
          password: 'abcd123',
          isAdmin: true,
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
            // Store this user's details for later tests.
            tests.user = {
              ...res.body,
              password: 'abcd123',
            };
            done();
          }
        });
    });

    it('it should create another User.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'Jane Doe',
          email: 'testuser2@example.com',
          mobile: '1234567890',
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
            // Store this user's details for later tests.
            tests.user2 = {
              ...res.body,
              password: 'abcd123',
            };
            done();
          }
        });
    });

    it('it should reject incorrect data format.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          document: {
            name: 'UserX',
            email: 'testuserx@example.com',
            password: 'abcd123',
          },
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject data with missing name.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          email: 'testuserx@example.com',
          password: 'abcd123',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject data with missing email.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User X',
          password: 'abcd123',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject data with missing password.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User X',
          email: 'testuserx@example.com',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject data with duplicate email.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User X',
          email: 'testuser1@example.com',
          password: 'abcd123',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.EMAIL_ALREADY_EXISTS);
            done();
          }
        });
    });

    it('it should reject data with null values.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: null,
          email: null,
          password: null,
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject empty body.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({})
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject data with invalid mobile number.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'Seven',
          email: 'seven@example.com',
          password: 'abcd123',
          mobile: '78965412300011445541',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should reject data with invalid email id.', (done) => {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'Eight',
          email: 'invalidemail.com',
          password: 'abcd123',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.success.should.be.false;
            res.body.should.not.have.property('id');
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });
  });

  // --- /POST authentication -------------------------------------------------------- //
  describe('/POST authentication', () => {
    it('it should authenticate the first user and get auth-token.', (done) => {
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
            res.body.should.have.property('user')
              .that.is.an('object');
            res.body.user.should.not.have.property('password');
            // Save authToken
            tests.authToken = res.body.access_token;
            tests.refreshToken = res.body.refresh_token;
            done();
          }
        });
    });

    it('it should authenticate the second user and get auth-token.', (done) => {
      chai.request(server)
        .post('/api/v1/auth/login')
        .send({
          grant_type: 'password',
          email: tests.user2.email,
          password: tests.user2.password,
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
            res.body.should.have.property('user')
              .that.is.an('object');
            res.body.user.should.not.have.property('password');
            // Save authToken
            tests.authToken2 = res.body.access_token;
            tests.refreshToken2 = res.body.refresh_token;
            done();
          }
        });
    });
  });

  // --- /GET users ------------------------------------------------------------------ //
  describe('/GET users', () => {
    it('it should get all users. Count should be 2 as we intented to create 2 users.', (done) => {
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            // Since we created 2 valid active users.
            res.body.should.be.a('array').that.has.lengthOf(2);
            done();
          }
        });
    });
    // Test with query params, i.e. filters
    // user_id in
    it('it should get all users whose id is passed in the query params.', (done) => {
      chai.request(server)
        .get(`/api/v1/users?user_id=${tests.user.id}&user_id=${tests.user2.id}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array').that.has.lengthOf(2);
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('id').that.is.oneOf([tests.user.id, tests.user2.id]);
            }
            done();
          }
        });
    });

    // Name equal
    it('it should get all users with name "John Doe"', (done) => {
      chai.request(server)
        .get('/api/v1/users?name=John%20Doe')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('name').that.is.equal('John Doe');
            }
            done();
          }
        });
    });

    // Multiname equal
    it('it should get all users with name "John Doe" or "Jane Doe"', (done) => {
      chai.request(server)
        .get(`/api/v1/users?name=${tests.user.name}&name=${tests.user2.name}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('name').that.is.oneOf([tests.user.name, tests.user2.name]);
            }
            done();
          }
        });
    });

    // Name like
    it('it should get all users with name like "Doe"', (done) => {
      chai.request(server)
        .get('/api/v1/users?nl=doe')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('name').that.match(/doe/gi);
            }
            done();
          }
        });
    });

    // email equal
    it('it should get a single user with matching email provided in request.', (done) => {
      chai.request(server)
        .get(`/api/v1/users?email=${tests.user.email}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array').that.has.lengthOf(1);
            const user = res.body[0];
            user.should.have.property('email').that.is.equal(tests.user.email);
            done();
          }
        });
    });

    // email in
    it('it should get all users with matching email provided in request array.', (done) => {
      chai.request(server)
        .get(`/api/v1/users?email=${tests.user.email}&email=${tests.user2.email}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('email').that.is.oneOf([tests.user.email, tests.user2.email]);
            }
            done();
          }
        });
    });

    // mobile equal
    it('it should get a single user with matching mobile provided in request.', (done) => {
      chai.request(server)
        .get(`/api/v1/users?mobile=${tests.user.mobile}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('mobile').that.is.equal(tests.user.mobile);
            }
            done();
          }
        });
    });

    // mobile in
    it('it should get all users with matching mobile provided in request array.', (done) => {
      chai.request(server)
        .get(`/api/v1/users?mobile=${tests.user.mobile}&mobile=${tests.user2.mobile}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('mobile').that.is.oneOf([tests.user.mobile, tests.user2.mobile]);
            }
            done();
          }
        });
    });
  });

  // --- /GET users/:user_id --------------------------------------------------------- //
  describe('/GET users/:user_id', () => {
    it('it should get user of the given id.', (done) => {
      chai.request(server)
        .get(`/api/v1/users/${tests.user.id}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id')
              .that.is.equal(tests.user.id);
            should.not.exist(res.body.password);
            should.not.exist(res.body.isDeleted);
            should.not.exist(res.body.isAdmin);
            done();
          }
        });
    });

    it('it should reject on invalid user id.', (done) => {
      chai.request(server)
        .get('/api/v1/users/abcd')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should return null on unknown(but valid) user id.', (done) => {
      chai.request(server)
        .get('/api/v1/users/598cabeac0fd27273c04620d') // Let's hope this id is not created during the tests :P
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.USER.NOT_FOUND);
            done();
          }
        });
    });
  });

  // --- /PUT users/:user_id ---------------------------------------------------------- //
  describe('/PUT users/:user_id', () => {
    it('it should allow user to update own profile.', (done) => {
      chai.request(server)
        .put(`/api/v1/users/${tests.user2.id}`)
        .set('x-access-token', tests.authToken2)
        .send({
          mobile: '7896541230',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id')
              .that.is.equal(tests.user2.id);
            res.body.should.have.property('email')
              .that.is.equal(tests.user2.email);
            res.body.should.have.property('mobile')
              .that.is.equal('7896541230');
            should.not.exist(res.body.password);
            should.not.exist(res.body.isDeleted);
            should.not.exist(res.body.isAdmin);
            done();
          }
        });
    });

    it('it should NOT allow second user to update other\'s profile.', (done) => {
      chai.request(server)
        .put(`/api/v1/users/${tests.user.id}`)
        .set('x-access-token', tests.authToken2)
        .send({
          mobile: '7896541231',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(403);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.FORBIDDEN);
            done();
          }
        });
    });

    it('it should allow admin user to update other\'s profile.', (done) => {
      chai.request(server)
        .put(`/api/v1/users/${tests.user2.id}`)
        .set('x-access-token', tests.authToken)
        .send({
          mobile: '7896541232',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id')
              .that.is.equal(tests.user2.id);
            res.body.should.have.property('email')
              .that.is.equal(tests.user2.email);
            res.body.should.have.property('mobile')
              .that.is.equal('7896541232');
            should.not.exist(res.body.password);
            should.not.exist(res.body.isDeleted);
            should.not.exist(res.body.isAdmin);
            done();
          }
        });
    });

    it('it should not update uneditable fields even if they are passed to be updated.', (done) => {
      chai.request(server)
        .put(`/api/v1/users/${tests.user2.id}`)
        .set('x-access-token', tests.authToken2)
        .send({
          id: 'custom-id',
          email: 'someemail@example.com',
          doj: new Date(),
          mobile: '7896541230',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            const user = res.body;
            user.should.be.a('object');
            user.should.have.property('id')
              .that.is.equal(tests.user2.id);
            user.should.have.property('email')
              .that.is.equal(tests.user2.email);
            user.should.have.property('doj')
              .that.is.equal(tests.user2.doj);
            user.should.have.property('mobile')
              .that.is.equal('7896541230');
            should.not.exist(user.password);
            should.not.exist(user.isDeleted);
            should.not.exist(user.isAdmin);
            done();
          }
        });
    });

    it('it should give 404 if user id is not passed.', (done) => {
      chai.request(server)
        .put('/api/v1/users/')
        .set('x-access-token', tests.authToken)
        .send({
          mobile: '7896541230',
        })
        .end((err, res) => {
          res.should.have.status(404);
          // res.body.should.be.a('object');
          // res.body.should.have.property('error').that.is.equal('MISSING_REQ_PARAM');
          done();
        });
    });

    it('it should give 404 if user id is non-existent but of valid format.', (done) => {
      chai.request(server)
        .put('/api/v1/users/5a37a97ec0d9d318201bb41b') // let's hope this id is not generated
        .set('x-access-token', tests.authToken)
        .send({
          mobile: '7896541230',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.USER.NOT_FOUND);
            done();
          }
        });
    });

    it('it should reject on invalid user id.', (done) => {
      chai.request(server)
        .put('/api/v1/users/abcd')
        .set('x-access-token', tests.authToken)
        .send({
          name: 'Johny Doe',
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });
  });

  // --- /DELETE users/:user_id ---------------------------------------------------------- //
  describe('/DELETE users/:user_id', () => {
    it('it should allow a user to delete own account.', (done) => {
      chai.request(server)
        .delete(`/api/v1/users/${tests.user2.id}`)
        .set('x-access-token', tests.authToken2)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').that.is.true;
            done();
          }
        });
    });

    it('it should NOT allow a user to delete another user\'s account.', (done) => {
      chai.request(server)
        .delete(`/api/v1/users/${tests.user.id}`)
        .set('x-access-token', tests.authToken2)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(403);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.FORBIDDEN);
            done();
          }
        });
    });

    it('it should allow admin to delete other\'s account.', (done) => {
      chai.request(server)
        .delete(`/api/v1/users/${tests.user2.id}`)
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').that.is.true;
            done();
          }
        });
    });

    it('it should give 404 if user id is not passed.', (done) => {
      chai.request(server)
        .delete('/api/v1/users/')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should reject on invalid user id.', (done) => {
      chai.request(server)
        .delete('/api/v1/users/abcd')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.not.have.property('id');
            res.body.success.should.be.false;
            res.body.should.have.property('errorCode')
              .that.is.a('string').that.is.equal(ERROR_CODES.INVALID_FIELD_VALUE);
            done();
          }
        });
    });

    it('it should get all users to see count decreased to 1 from 2.', (done) => {
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', tests.authToken)
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            // Since we created 2 valid active users but deleted 1 user.
            res.body.should.be.a('array').that.has.lengthOf(1);
            done();
          }
        });
    });
  });
});

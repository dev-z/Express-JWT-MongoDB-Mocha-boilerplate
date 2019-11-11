/* eslint-disable prefer-arrow-callback, func-names, comma-dangle,
 no-unused-expressions, no-unused-vars */
// Require the dev-dependencies
/*
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Users', function () {
  // --- HOOKS ----------------------------------------------------------------------- //
  // runs before all tests in this block
  before(function (done) {
    // A little delay so the DB connection is established and _startServer() is called.
    setTimeout(function () {
      // Create global variable for storing some temp data.
      global.tests = {};
      // Clear User model
      global.User.remove({}, function (err) {
        if (err) {
          console.error('Error in clearing User model.', err);
        }
      });
      // Clear Feed model
      global.Feed.remove({}, function (err) {
        if (err) {
          console.error('Error in clearing Feed model.', err);
        }
      });
      // Clear Card model
      global.Card.remove({}, function (err) {
        if (err) {
          console.error('Error in cleaning Card model.', err);
        }
      });
      done();
    }, 1000);
  });

  // runs after all tests in this block
  after(function (done) {
    // --- Clear global variables --- //
    global.tests = undefined;
    // --- Clear all Models --- //
    // Clear User model
    global.User.remove({}, function (err) {
      if (err) {
        console.error('Error in clearing User model after User tests.', err);
      }
    });
    // Clear Feed model
    global.Feed.remove({}, function (err) {
      if (err) {
        console.error('Error in clearing Feed model after User tests.', err);
      }
    });
    // Clear Card model
    global.Card.remove({}, function (err) {
      if (err) {
        console.error('Error in cleaning Card model after User tests.', err);
      }
    });
    done();
  });

  // --- TESTS ----------------------------------------------------------------------- //
  // --- /POST users ----------------------------------------------------------------- //
  describe('/POST users', function () {
    it('it should create ONE User.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'John Doe',
          email: 'testuser1@example.com',
          mobile: '9740322391',
          password: 'abcd123',
          isAdmin: true,
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
            // Store this user's details for later tests.
            global.tests.user = {
              id: res.body._id,
              name: res.body.name,
              email: res.body.email,
              mobile: res.body.mobile,
              password: 'abcd123',
              doj: res.body.doj,
            };
            done();
          }
        });
    });

    it('it should create another User.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'Jane Doe',
          email: 'testuser2@example.com',
          mobile: '8981505142',
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
            // Store this user's details for later tests.
            global.tests.user2 = {
              id: res.body._id,
              name: res.body.name,
              email: res.body.email,
              mobile: res.body.mobile,
              password: 'abcd123',
              doj: res.body.doj,
            };
            done();
          }
        });
    });

    it('it should reject incorrect data format.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          document: {
            name: 'UserX',
            email: 'testuserx@example.com',
            password: 'abcd123',
          }
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject data with missing name.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          email: 'testuserx@example.com',
          password: 'abcd123'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject data with missing email.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User X',
          password: 'abcd123'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject data with missing password.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User X',
          email: 'testuserx@example.com'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject data with duplicate email.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'User X',
          email: 'testuser1@example.com',
          password: 'abcd123'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('MongoError');
          res.body.should.have.property('code')
            .that.is.equal(11000); // DUP KEY CODE
          done();
        });
    });

    it('it should reject data with null values.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: null,
          email: null,
          password: null
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject empty body.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({})
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject data with invalid mobile number.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'Seven',
          email: 'seven@example.com',
          password: 'abcd123',
          mobile: '78965412300011445541'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });

    it('it should reject data with invalid email id.', function (done) {
      chai.request(server)
        .post('/api/v1/users')
        .send({
          name: 'Eight',
          email: 'invalidemail.com',
          password: 'abcd123'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error')
            .that.is.equal('ValidationError');
          done();
        });
    });
  });

  // --- /POST authentication -------------------------------------------------------- //
  describe('/POST authentication', function () {
    it('it should authenticate the first user and get auth-token.', function (done) {
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
            res.body.should.have.property('success')
              .that.is.true;
            res.body.should.have.property('token')
              .that.is.a('string');
            res.body.should.have.property('user')
              .that.is.an('object');

            // Save authToken
            global.tests.authToken = res.body.token;
            done();
          }
        });
    });

    it('it should authenticate the second user and get auth-token.', function (done) {
      chai.request(server)
        .post('/api/v1/authentication')
        .send({
          email: global.tests.user2.email,
          password: global.tests.user2.password,
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('success')
              .that.is.true;
            res.body.should.have.property('token')
              .that.is.a('string');
            res.body.should.have.property('user')
              .that.is.an('object');

            // Save authToken
            global.tests.authToken2 = res.body.token;
            done();
          }
        });
    });
  });

  // --- /GET users ------------------------------------------------------------------ //
  describe('/GET users', function () {
    it('it should get all users. Count should be 2 as we intented to create 2 users.', function (done) {
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array').that.has.lengthOf(2); // Since we created 2 valid active users.
            done();
          }
        });
    });
    // Test with query params, i.e. filters
    // user_id in
    it('it should get all users whose id is passed in the query params.', function (done) {
      chai.request(server)
        .get(`/api/v1/users?user_id=${global.tests.user.id}&user_id=${global.tests.user2.id}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array').that.has.lengthOf(2);
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('_id').that.is.oneOf([global.tests.user.id, global.tests.user2.id]);
            }
            done();
          }
        });
    });

    // Name equal
    it('it should get all users with name "John Doe"', function (done) {
      chai.request(server)
        .get('/api/v1/users?name=John%20Doe')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
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
    it('it should get all users with name "John Doe" or "Jane Doe"', function (done) {
      chai.request(server)
        .get(`/api/v1/users?name=${global.tests.user.name}&name=${global.tests.user2.name}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('name').that.is.oneOf([global.tests.user.name, global.tests.user2.name]);
            }
            done();
          }
        });
    });

    // Name like
    it('it should get all users with name like "Doe"', function (done) {
      chai.request(server)
        .get('/api/v1/users?nl=doe')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
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
    it('it should get a single user with matching email provided in request.', function (done) {
      chai.request(server)
        .get(`/api/v1/users?email=${global.tests.user.email}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array').that.has.lengthOf(1);
            const user = res.body[0];
            user.should.have.property('email').that.is.equal(global.tests.user.email);
            done();
          }
        });
    });

    // email in
    it('it should get all users with matching email provided in request array.', function (done) {
      chai.request(server)
        .get(`/api/v1/users?email=${global.tests.user.email}&email=${global.tests.user2.email}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('email').that.is.oneOf([global.tests.user.email, global.tests.user2.email]);
            }
            done();
          }
        });
    });

    // mobile equal
    it('it should get a single user with matching mobile provided in request.', function (done) {
      chai.request(server)
        .get(`/api/v1/users?mobile=${global.tests.user.mobile}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('mobile').that.is.equal(global.tests.user.mobile);
            }
            done();
          }
        });
    });

    // mobile in
    it('it should get all users with matching mobile provided in request array.', function (done) {
      chai.request(server)
        .get(`/api/v1/users?mobile=${global.tests.user.mobile}&mobile=${global.tests.user2.mobile}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array');
            for (let i = 0; i < res.body.length; i += 1) {
              const user = res.body[i];
              user.should.have.property('mobile').that.is.oneOf([global.tests.user.mobile, global.tests.user2.mobile]);
            }
            done();
          }
        });
    });
  });

  // --- /GET users/:user_id --------------------------------------------------------- //
  describe('/GET users/:user_id', function () {
    it('it should get user of the given id.', function (done) {
      chai.request(server)
        .get(`/api/v1/users/${global.tests.user.id}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id')
              .that.is.equal(global.tests.user.id);
            should.not.exist(res.body.password);
            should.not.exist(res.body.isDeleted);
            should.not.exist(res.body.isAdmin);
            done();
          }
        });
    });

    it('it should reject on invalid user id.', function (done) {
      chai.request(server)
        .get('/api/v1/users/abcd')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('kind')
            .that.is.equal('ObjectId');
          res.body.should.have.property('path')
            .that.is.equal('_id');
          res.body.should.have.property('message')
            .that.has.string('Cast to ObjectId failed');
          done();
        });
    });

    it('it should return null on unknown(but valid) user id.', function (done) {
      chai.request(server)
        .get('/api/v1/users/598cabeac0fd27273c04620d') // Let's hope this id is not created during the tests :P
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          res.should.have.status(404);
          res.body.should.have.property('error');
          res.body.should.have.property('message');
          done();
        });
    });
  });

  // --- /PUT users/:user_id ---------------------------------------------------------- //
  describe('/PUT users/:user_id', function () {
    it('it should allow user to update own profile.', function (done) {
      chai.request(server)
        .put(`/api/v1/users/${global.tests.user2.id}`)
        .set('x-access-token', global.tests.authToken2)
        .send({
          mobile: '7896541230'
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id')
              .that.is.equal(global.tests.user2.id);
            res.body.should.have.property('email')
              .that.is.equal(global.tests.user2.email);
            should.not.exist(res.body.password);
            should.not.exist(res.body.isDeleted);
            should.not.exist(res.body.isAdmin);
            done();
          }
        });
    });

    it('it should NOT allow second user to update other\'s profile.', function (done) {
      chai.request(server)
        .put(`/api/v1/users/${global.tests.user.id}`)
        .set('x-access-token', global.tests.authToken2)
        .send({
          mobile: '7896541231'
        })
        .end(function (err, res) {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('error').that.is.equal('UNAUTHORISED');
          done();
        });
    });

    it('it should allow admin user to update other\'s profile.', function (done) {
      chai.request(server)
        .put(`/api/v1/users/${global.tests.user2.id}`)
        .set('x-access-token', global.tests.authToken)
        .send({
          mobile: '7896541232'
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('_id')
              .that.is.equal(global.tests.user2.id);
            res.body.should.have.property('email')
              .that.is.equal(global.tests.user2.email);
            should.not.exist(res.body.password);
            should.not.exist(res.body.isDeleted);
            should.not.exist(res.body.isAdmin);
            done();
          }
        });
    });

    it('it should not update uneditable fields even if they are passed to be updated.', function (done) {
      chai.request(server)
        .put(`/api/v1/users/${global.tests.user2.id}`)
        .set('x-access-token', global.tests.authToken2)
        .send({
          email: 'someemail@example.com',
          doj: new Date(),
          mobile: '7896541230',
        })
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            const user = res.body;
            user.should.be.a('object');
            user.should.have.property('_id')
              .that.is.equal(global.tests.user2.id);
            user.should.have.property('email')
              .that.is.equal(global.tests.user2.email);
            user.should.have.property('doj')
              .that.is.equal(global.tests.user2.doj);
            user.should.have.property('name')
              .that.is.equal(global.tests.user2.name);
            user.should.have.property('mobile')
              .that.is.equal('7896541230');
            should.not.exist(user.password);
            should.not.exist(user.isDeleted);
            should.not.exist(user.isAdmin);
            done();
          }
        });
    });

    it('it should give 404 if user id is not passed.', function (done) {
      chai.request(server)
        .put('/api/v1/users/')
        .set('x-access-token', global.tests.authToken)
        .send({
          mobile: '7896541230'
        })
        .end(function (err, res) {
          res.should.have.status(404);
          // res.body.should.be.a('object');
          // res.body.should.have.property('error').that.is.equal('MISSING_REQ_PARAM');
          done();
        });
    });

    it('it should give 404 if user id non-existent but of valid format.', function (done) {
      chai.request(server)
        .put('/api/v1/users/5a37a97ec0d9d318201bb41b') // let's hope this id is not generated
        .set('x-access-token', global.tests.authToken)
        .send({
          mobile: '7896541230'
        })
        .end(function (err, res) {
          res.should.have.status(404);
          done();
        });
    });

    it('it should reject on invalid user id.', function (done) {
      chai.request(server)
        .put('/api/v1/users/abcd')
        .set('x-access-token', global.tests.authToken)
        .send({
          name: 'Johny Doe'
        })
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.have.property('kind')
            .that.is.equal('ObjectId');
          res.body.error.should.have.property('path')
            .that.is.equal('_id');
          res.body.error.should.have.property('message')
            .that.has.string('Cast to ObjectId failed');
          done();
        });
    });
  });

  // --- /DELETE users/:user_id ---------------------------------------------------------- //
  describe('/DELETE users/:user_id', function () {
    it('it should allow a user to delete own account.', function (done) {
      chai.request(server)
        .delete(`/api/v1/users/${global.tests.user2.id}`)
        .set('x-access-token', global.tests.authToken2)
        .end(function (err, res) {
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

    it('it should NOT allow a user to delete another user\'s account.', function (done) {
      chai.request(server)
        .delete(`/api/v1/users/${global.tests.user.id}`)
        .set('x-access-token', global.tests.authToken2)
        .end(function (err, res) {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('error').that.is.equal('UNAUTHORISED');
          done();
        });
    });

    it('it should allow admin to delete other\'s account.', function (done) {
      chai.request(server)
        .delete(`/api/v1/users/${global.tests.user2.id}`)
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
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

    it('it should give 404 if user id is not passed.', function (done) {
      chai.request(server)
        .delete('/api/v1/users/')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          res.should.have.status(404);
          // res.body.should.be.a('object');
          // res.body.should.have.property('error').that.is.equal('MISSING_REQ_PARAM');
          done();
        });
    });

    it('it should reject on invalid user id.', function (done) {
      chai.request(server)
        .delete('/api/v1/users/abcd')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          res.body.error.should.have.property('kind')
            .that.is.equal('ObjectId');
          res.body.error.should.have.property('path')
            .that.is.equal('_id');
          res.body.error.should.have.property('message')
            .that.has.string('Cast to ObjectId failed');
          done();
        });
    });

    it('it should get all users to see count decreased to 1 from 2.', function (done) {
      chai.request(server)
        .get('/api/v1/users')
        .set('x-access-token', global.tests.authToken)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a('array').that.has.lengthOf(1); // Since we created 2 valid active users but deleted 1 user.
            done();
          }
        });
    });
  });
});
*/

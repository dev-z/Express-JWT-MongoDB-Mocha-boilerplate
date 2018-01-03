/* ----------------------------------------------- *
 *                API Server                       *
 * ----------------------------------------------- */
// Importing the core modules ------------------- //
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// BASE CONFIGURATIONS -------------------------- //
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Load libraries to be used globally ---------- //
global.moment = require('moment');
global.mongoose = require('mongoose');
global.jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// Require route initiator functions ----------- //
const userRoutes = require('./app/routes/user');
const authRoutes = require('./app/routes/authentication');
const userUnpRoutes = require('./app/routes/user_unprotected');

// ROUTES FOR API ------------------------------ //
const router = express.Router();

// HELPER FUNCTIONS ---------------------------- //
/* eslint-disable global-require */
function loadUtils() {
  global.utils = {};
  global.utils.regex = require('./app/utils/regex');
}

function loadModels() {
  global.User = require('./app/models/User'); // User
}

function loadServices() {
  global.authenticationService = require('./app/services/authentication')();
  global.userService = require('./app/services/user')(); // User
}
/* eslint-enable global-require */

function loadRoutes() {
  // --- UNPROTECTED ROUTES --- //
  // Test route to make sure everything is working
  router.get('/', (req, res) => {
    res.status(200).json({
      message: 'FlashCards-API is up and running!',
    });
  });
  // Authentcation routes
  authRoutes(router);
  // User unprotected routes
  userUnpRoutes(router);

  // Middleware to use for all requests
  router.use((req, res, next) => {
    // Authenticating the incoming requests for all routes listed below this function.
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
      // verifies secret and checks exp
      global.jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).json({
            success: false,
            message: 'Failed to authenticate token.',
            error: 'UNAUTHORISED',
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.requesterData = decoded;
          // do logging or whatever is needed
          next();
        }
      });
    } else {
      // if there is no token, return an error
      res.status(403).send({
        success: false,
        message: 'No token provided. Please refer to docs to how to send your token.',
        error: 'NO_TOKEN',
      });
    }
  });

  // --- PROTECTED ROUTES --- //
  userRoutes(router); // User - protected routes
  // Place more routes here

  // REGISTER OUR ROUTES ------------------------- //
  // base route is /api/version
  app.use('/api/v1', router);
}

function startServer() {
  loadUtils();
  loadModels();
  loadServices();
  loadRoutes();
  const port = process.env.PORT || 8001;
  app.listen(port, () => {
    console.info(`API Server up and running on port ${port} in ${process.env.ENV} mode.`);
  });
}

// START THE SERVER ----------------------------- //
// 1. Try connecting to DB
const connectDB = require('./app/config/dbcon');

connectDB().then(() => {
  // 2. If successful, start server.
  console.info('DB connection successfull.');
  startServer();
}, (err) => {
  // Otherwise log and stop.
  console.error('Error connecting to DB.');
  console.error(err);
  process.exit(0);
});

module.exports = app;

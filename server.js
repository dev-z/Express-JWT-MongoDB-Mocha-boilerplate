/* ----------------------------------------------- *
 *                API Server                       *
 * ----------------------------------------------- */
// Importing the core modules ------------------- //
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// BASE CONFIGURATIONS -------------------------- //
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Require route initiator functions ----------- //
const userRoutes = require('./app/routes/user');
const authRoutes = require('./app/routes/authentication');
const userUnprotectedRoutes = require('./app/routes/user_unprotected');

// ROUTES FOR API ------------------------------ //
const router = express.Router();

// HELPER FUNCTIONS ---------------------------- //

function loadRoutes() {
  // --- UNPROTECTED ROUTES --- //
  // Health check route to make sure everything is working
  router.get('/', (req, res) => {
    res.status(200).json({
      message: 'API server is up and running!',
    });
  });
  // Authentcation routes
  authRoutes(router);
  // User unprotected routes
  userUnprotectedRoutes(router);

  // Auth Middleware to use for all requests defined below
  router.use((req, res, next) => {
    // Authenticating the incoming requests for all routes listed below this function.
    // check header or url parameters for token
    const token = req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).json({
            success: false,
            message: 'Failed to authenticate token.',
            errorCode: 'UNAUTHORISED',
          });
        } else {
          // if everything is good, save payload details in request object for use in other routes
          req.requesterData = decoded;
          // do logging or whatever is needed
          next();
        }
      });
    } else {
      // if there is no token, return an error
      res.status(401).json({
        success: false,
        message: 'No token provided. Please refer to docs to how to send your token.',
        errorCode: 'NO_TOKEN',
      });
    }
  });
  // Any routes initiated below this line will be checked by the JWT auth middleware defined above

  // --- PROTECTED ROUTES --- //
  userRoutes(router); // User - protected routes
  // Place more routes here

  // REGISTER OUR ROUTES ------------------------- //
  // base route is /api/version
  app.use('/api/v1', router);
}

function startServer() {
  loadRoutes();
  const port = process.env.PORT || 8001;
  app.listen(port, () => {
    console.info(`API Server up and running on port ${port} in ${process.env.NODE_ENV} mode.`);
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
  console.error('Error connecting to DB. Unable to start API server');
  console.error(err);
  process.exit(1);
});

module.exports = app;

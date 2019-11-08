/* ----------------------------------------------- *
 *                API Server                       *
 * ----------------------------------------------- */
// Importing the core modules ------------------- //
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const middlewares = require('./app/utils/middlewares');

// BASE CONFIGURATIONS -------------------------- //
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// compress all responses
app.use(compression());

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
  // TODO Use middleware to log request details
  // Use middleware to convert request body to camelCase
  router.use(middlewares.camelizer);
  // Authentcation routes
  authRoutes(router);
  // User unprotected routes
  userUnprotectedRoutes(router);

  // Auth Middleware to use for all requests defined below
  router.use(middlewares.JWTVerifier);
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
